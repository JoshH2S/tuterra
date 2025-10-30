
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "../_shared/cors.ts";

// OpenAI API configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to clean up JSON responses that might be wrapped in markdown code blocks
function cleanupJSONContent(content: string): string {
  if (!content) return "";
  
  let cleanContent = content.trim();
  
  // Remove markdown code block formatting (```json and ```)
  if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.replace(/^```[a-z]*\n?/i, '');
    cleanContent = cleanContent.replace(/\n?```$/g, '');
  }
  
  return cleanContent.trim();
}

const generatePrompt = (industry: string, role: string, additionalInfo: string) => {
  return `
    Create a comprehensive skill assessment for a ${role} position in the ${industry} industry.
    
    ${additionalInfo ? `Additional information about the role: ${additionalInfo}` : ""}
    
    Your task is to generate:
    
    1. A brief description of the skills required for this role (1-2 paragraphs).
    2. A list of key skills being tested in this assessment.
    3. 10 multiple-choice or multiple-answer questions that assess these skills.
    
    For each question:
    - Provide a clear, concise question
    - For multiple-choice questions, provide 4 options labeled A, B, C, D
    - For multiple-answer questions, provide 4-6 options labeled A, B, C, D, etc.
    - Indicate the correct answer(s)
    - Assign a skill category to each question
    
    Format your response as a JSON object with the following structure:
    
    {
      "description": "Description text here...",
      "skills_tested": ["Skill 1", "Skill 2", ...],
      "questions": [
        {
          "question": "Question text here...",
          "type": "multiple_choice", // or "multiple_answer"
          "options": {
            "A": "Option A text",
            "B": "Option B text",
            "C": "Option C text",
            "D": "Option D text"
          },
          "correctAnswer": "B", // or ["A", "C"] for multiple-answer
          "skill": "Relevant skill category"
        },
        // More questions...
      ]
    }
    
    Make sure the questions adequately assess both fundamental and advanced skills for the role. Include scenario-based questions where appropriate.
    
    Design considerations:
    - Create concise, mobile-friendly questions that display well on small screens
    - Ensure option text is brief enough to read on mobile devices
    - Use touch-friendly language (e.g., "tap" instead of "click")
    - Consider thumb zones when designing multiple-choice options
  `;
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { industry, role, additionalInfo, modelType, maxTokens } = await req.json();

    if (!industry || !role) {
      return new Response(
        JSON.stringify({ 
          error: "Industry and role are required",
          success: false 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call OpenAI API
    const prompt = generatePrompt(industry, role, additionalInfo || "");
    
    console.log("Sending request to OpenAI API with prompt:", prompt.substring(0, 100) + "...");

    const model = modelType || "gpt-4o-mini";
    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are an expert in creating skill assessments for job roles. Provide detailed, accurate, and relevant questions that truly test a candidate's abilities. Optimize content for mobile device viewing.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: Math.min(maxTokens || 4000, 16384), // GPT-4o supports much higher limits
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error("OpenAI API error:", error);
      
      // Return more detailed error information
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API error", 
          details: error,
          success: false
        }),
        {
          status: openAIResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await openAIResponse.json();
    const responseContent = data.choices[0].message.content;
    const tokenUsage = data.usage?.total_tokens || 0;
    
    console.log("OpenAI response received, first 100 chars:", responseContent.substring(0, 100) + "...");
    console.log("Token usage:", tokenUsage);
    
    // Clean up the response content to handle markdown-formatted JSON
    const cleanedContent = cleanupJSONContent(responseContent);
    console.log("Cleaned content, first 100 chars:", cleanedContent.substring(0, 100) + "...");
    
    // Parse the JSON from the cleaned response
    try {
      const assessment = JSON.parse(cleanedContent);
      
      // Add mobile-friendly metadata
      assessment.metadata = {
        optimizedForMobile: true,
        generatedWithModel: model,
        timestamp: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify({ 
          assessment,
          token_usage: tokenUsage,
          success: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Content that failed to parse:", cleanedContent);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse assessment JSON", 
          details: parseError.message,
          content: cleanedContent.substring(0, 500) + "...", // Including part of the content for debugging
          success: false
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate assessment", 
        details: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
