
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";
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

    // Initialize OpenAI client properly
    const configuration = new Configuration({
      apiKey: openAiKey,
      // Remove any default headers that might conflict
      baseOptions: {
        headers: {
          "Content-Type": "application/json",
        },
      },
    });

    // Create OpenAI client without any custom Axios config
    const openai = new OpenAIApi(configuration);

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
    
    // Generate feedback with OpenAI
    const promptText = `
    You are an expert interview coach. Review the following job interview transcript and provide constructive feedback:
    
    ${formattedTranscript}
    
    Provide an analysis in JSON format with the following structure:
    {
      "feedback": "Overall feedback and analysis",
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "areas_for_improvement": ["Area 1", "Area 2", "Area 3"],
      "overall_score": A number from 1-10 rating the overall interview performance
    }
    `;
    
    try {
      // Make the OpenAI API call
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful interview coach that provides constructive feedback." },
          { role: "user", content: promptText }
        ],
        temperature: 0.7,
      });
      
      const responseText = completion.data.choices[0]?.message?.content || "{}";
      
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
          feedback: feedbackData.feedback,
          strengths: feedbackData.strengths,
          areas_for_improvement: feedbackData.areas_for_improvement,
          overall_score: feedbackData.overall_score
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
