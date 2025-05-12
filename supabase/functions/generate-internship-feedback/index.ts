
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openAiApiKey = Deno.env.get("OPENAI_API_KEY")!;

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
    const { sessionId, transcript, jobTitle, industry } = await req.json();
    
    if (!sessionId || !transcript || transcript.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Format the transcript for the prompt
    const formattedTranscript = transcript
      .map((item, index) => `Q: ${item.question}\nA: ${item.answer}`)
      .join("\n\n");
    
    // Create the prompt for the AI
    const prompt = `You are an HR manager evaluating a candidate for a ${jobTitle} role in the ${industry} sector. Based on the following job interview responses, provide a short review of the candidate's performance. Highlight 1-2 strengths and 1 area for improvement. Be encouraging and helpful.\n\n${formattedTranscript}`;
    
    try {
      console.log("Sending request to OpenAI...");
      
      // Make API call to OpenAI
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using a fast, cost-effective model
          messages: [
            { role: "system", content: "You are a helpful HR assistant providing constructive feedback." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", errorText);
        throw new Error(`OpenAI API request failed: ${response.status} - ${errorText}`);
      }
      
      const completion = await response.json();
      const feedbackText = completion.choices[0]?.message?.content || "";
      
      console.log("Received feedback from OpenAI");
      
      // Store the feedback and transcript in the internship_progress table
      const { data: progressData, error: progressError } = await supabase
        .from('internship_progress')
        .insert({
          user_id: req.headers.get('x-userid') || null,
          session_id: sessionId,
          phase_number: 1,
          user_responses: transcript,
          ai_feedback: feedbackText,
        })
        .select()
        .single();
      
      if (progressError) {
        console.error("Error saving to internship_progress:", progressError);
        throw progressError;
      }
      
      return new Response(
        JSON.stringify({ feedback: feedbackText, progressId: progressData.id }),
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
