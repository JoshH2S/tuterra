
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openAiKey = Deno.env.get("OPENAI_API_KEY")!;

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
    
    if (!sessionId || !transcript || !jobTitle || !industry) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters",
          details: "sessionId, transcript, jobTitle, and industry are required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Format the transcript for the prompt
    const formattedTranscript = transcript.map((item: any, index: number) => {
      return `Q: ${item.question}\nA: ${item.answer}`;
    }).join("\n\n");
    
    // Create the system prompt for GPT
    const systemPrompt = `
    You are an HR manager evaluating a candidate for a ${jobTitle} role in the ${industry} sector. 
    Based on the following job interview responses, provide a short review of the candidate's performance. 
    Highlight 1–2 strengths and 1 area for improvement. Be encouraging and helpful.

    ${formattedTranscript}
    `;
    
    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: systemPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }
    
    const completion = await openAIResponse.json();
    const feedback = completion.choices[0]?.message?.content || "";
    
    if (!feedback) {
      throw new Error("Failed to generate feedback");
    }

    // Return the feedback
    return new Response(
      JSON.stringify({ feedback }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in generate-internship-feedback:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
