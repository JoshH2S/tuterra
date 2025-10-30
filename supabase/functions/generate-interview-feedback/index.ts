
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Initialize Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get OpenAI API key from environment
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const { sessionId, transcript } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing session ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid transcript data",
          details: "Transcript must be a non-empty array"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    console.log(`Generating feedback for interview session ${sessionId}`);
    
    // Format the transcript for the prompt
    const formattedTranscript = transcript
      .map((item, index) => `Question ${index + 1}: ${item.question}\nAnswer: ${item.answer}`)
      .join("\n\n");
    
    // Create the system prompt for the AI
    const systemPrompt = `
    You are an expert interview coach. Review the following job interview transcript and provide constructive feedback:
    
    Provide an analysis in JSON format with the following structure:
    {
      "feedback": "Overall feedback and analysis",
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "areas_for_improvement": ["Area 1", "Area 2", "Area 3"],
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    }
    `;
    
    try {
      // Make direct API call to OpenAI using fetch
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`
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
              content: formattedTranscript 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", errorText);
        throw new Error(`OpenAI API request failed: ${response.status} - ${errorText}`);
      }
      
      const completion = await response.json();
      const responseText = completion.choices[0]?.message?.content || "{}";
      
      // Parse the response to extract the feedback
      let feedbackData;
      try {
        // Clean the response text to ensure it's valid JSON
        const cleaned = responseText.replace(/```json|```/g, "").trim();
        feedbackData = JSON.parse(cleaned);
      } catch (error) {
        console.error("Error parsing feedback:", error);
        return new Response(
          JSON.stringify({ error: "Failed to parse feedback from AI response" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      // Save feedback to the database
      const { data, error } = await supabase
        .from('interview_feedback')
        .insert({
          session_id: sessionId,
          overall_feedback: feedbackData.feedback,
          strengths: feedbackData.strengths,
          weaknesses: feedbackData.areas_for_improvement,
          tips: feedbackData.tips || []
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error saving feedback:", error);
        return new Response(
          JSON.stringify({ error: "Failed to save feedback to the database" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ feedback: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } catch (openAiError) {
      console.error("OpenAI API error:", openAiError);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${openAiError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
