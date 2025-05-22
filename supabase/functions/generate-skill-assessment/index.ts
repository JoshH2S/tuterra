
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
  `;
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { industry, role, additionalInfo } = await req.json();

    if (!industry || !role) {
      return new Response(
        JSON.stringify({ error: "Industry and role are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call OpenAI API
    const prompt = generatePrompt(industry, role, additionalInfo || "");
    
    console.log("Sending request to OpenAI API with prompt:", prompt.substring(0, 100) + "...");

    const openAIResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "system",
            content: "You are an expert in creating skill assessments for job roles. Provide detailed, accurate, and relevant questions that truly test a candidate's abilities.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error("OpenAI API error:", error);
      throw new Error(JSON.stringify(error));
    }

    const data = await openAIResponse.json();
    const responseContent = data.choices[0].message.content;
    
    console.log("OpenAI response received, first 100 chars:", responseContent.substring(0, 100) + "...");
    
    // Clean up the response content to handle markdown-formatted JSON
    const cleanedContent = cleanupJSONContent(responseContent);
    console.log("Cleaned content, first 100 chars:", cleanedContent.substring(0, 100) + "...");
    
    // Parse the JSON from the cleaned response
    try {
      const assessment = JSON.parse(cleanedContent);
      
      return new Response(
        JSON.stringify({ assessment }),
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
          content: cleanedContent.substring(0, 500) + "..." // Including part of the content for debugging
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
      JSON.stringify({ error: "Failed to generate assessment", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
