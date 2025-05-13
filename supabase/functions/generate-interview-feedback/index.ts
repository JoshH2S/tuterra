
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Environment variables
const openAIApiKey = Deno.env.get("OPENAI_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse request body
    const { transcript, jobTitle, industry, isInternship = false } = await req.json();
    
    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid transcript data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Format transcript for the AI
    const formattedTranscript = transcript.map((item, index) => 
      `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`
    ).join("\n\n");
    
    // Create a system prompt depending on whether this is for an internship
    const systemPrompt = isInternship 
      ? `You are an HR manager evaluating a candidate for a ${jobTitle} internship in the ${industry} sector. You need to provide constructive and encouraging feedback.` 
      : `You are an HR manager evaluating a candidate for a ${jobTitle} role in the ${industry} sector. Your feedback should be professional and balanced.`;
    
    // Create a user prompt depending on context
    const userPrompt = isInternship
      ? `Based on the following interview responses, provide 1-2 strengths and 1 constructive improvement. Be helpful and encouraging as this is for an internship candidate.\n\n${formattedTranscript}` 
      : `Based on the following interview responses, provide a detailed evaluation with strengths and areas for improvement.\n\n${formattedTranscript}`;
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const feedbackText = data.choices[0].message.content;
    
    // Extract strengths and weaknesses with regex patterns
    let strengths: string[] = [];
    let weaknesses: string[] = [];
    
    // Look for patterns like "Strengths:", "Strengths include:", etc.
    const strengthsMatch = feedbackText.match(/strengths?(?:\s+include)?(?:\s*:|\s*-|\s*•|\s*\*|\s*are|\s*\d\.)(.*?)(?:areas?\s+for\s+improvement|improvement\s+areas?|weaknesses?|constructive\s+feedback|opportunity|could\s+improve|suggestions?|next\s+steps?|to\s+improve|in\s+the\s+future|$)/is);
    
    // Look for patterns like "Areas for Improvement:", "Weakness:", "Could improve:", etc.
    const weaknessesMatch = feedbackText.match(/(?:areas?\s+for\s+improvement|improvement\s+areas?|weaknesses?|constructive\s+feedback|opportunity|could\s+improve|suggestions?|next\s+steps?|to\s+improve)(?:\s*:|\s*-|\s*•|\s*\*|\s*are|\s*\d\.)(.*?)(?:conclusion|summary|overall|in\s+summary|finally|$)/is);
    
    // Process matches to extract bullet points or sentences
    if (strengthsMatch && strengthsMatch[1]) {
      const strengthsText = strengthsMatch[1].trim();
      // Try to split by bullet points, numbers, or sentences
      const rawStrengths = strengthsText
        .split(/(?:\r?\n|\r)(?:\s*[-•*]|\s*\d+\.|\s*•)/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
        
      if (rawStrengths.length > 0) {
        strengths = rawStrengths;
      } else {
        // If no bullet points found, just use the whole text
        strengths = [strengthsText];
      }
    }
    
    if (weaknessesMatch && weaknessesMatch[1]) {
      const weaknessesText = weaknessesMatch[1].trim();
      // Try to split by bullet points, numbers, or sentences
      const rawWeaknesses = weaknessesText
        .split(/(?:\r?\n|\r)(?:\s*[-•*]|\s*\d+\.|\s*•)/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
        
      if (rawWeaknesses.length > 0) {
        weaknesses = rawWeaknesses;
      } else {
        // If no bullet points found, just use the whole text
        weaknesses = [weaknessesText];
      }
    }
    
    // Create a feedback object
    const feedback = {
      id: crypto.randomUUID(),
      session_id: '',
      overall_feedback: feedbackText,
      strengths: strengths,
      weaknesses: weaknesses,
      tips: [],
      created_at: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        feedback
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error generating interview feedback:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred generating feedback" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
