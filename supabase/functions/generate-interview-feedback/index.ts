
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openAIApiKey = Deno.env.get("OPENAI_API_KEY")!;

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
    const { sessionId, jobTitle, industry, responses } = await req.json();
    
    if (!sessionId || !responses || !Array.isArray(responses)) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Format the interview responses for the prompt
    let formattedResponses = "";
    responses.forEach((item, index) => {
      formattedResponses += `Q: ${item.question}\nA: ${item.response}\n\n`;
    });

    // Create prompt for GPT
    const prompt = `You are an HR manager evaluating a candidate for a ${jobTitle} role in the ${industry} sector. Based on the following job interview responses, provide a short review of the candidate's performance. Highlight 1-2 strengths and 1 area for improvement. Be encouraging and helpful.\n\n${formattedResponses}`;

    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an HR professional providing feedback on job interview responses."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const openAIData = await openAIResponse.json();
    const feedback = openAIData.choices[0].message.content;

    // Store the feedback and progress in the database
    const { data: progressData, error: progressError } = await supabase
      .from('internship_progress')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        session_id: sessionId,
        phase_number: 1,
        user_responses: responses,
        ai_feedback: feedback,
      })
      .select('id')
      .single();

    if (progressError) {
      console.error("Error saving interview progress:", progressError);
      throw new Error(`Failed to save interview progress: ${progressError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        feedback,
        progressId: progressData.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
