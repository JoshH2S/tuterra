
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface InterviewTranscript {
  question: string;
  answer: string;
}

interface RequestPayload {
  sessionId: string;
  transcript: InterviewTranscript[];
  jobTitle: string;
  industry: string;
}

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  try {
    // Parse request body
    const { sessionId, transcript, jobTitle, industry } = await req.json() as RequestPayload;
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!transcript || transcript.length === 0) {
      return new Response(
        JSON.stringify({ error: "No transcript data provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Format the transcript for the prompt
    const formattedTranscript = transcript.map((item, index) => 
      `Q${index+1}: ${item.question}\nA${index+1}: ${item.answer}`
    ).join("\n\n");

    // Create the prompt
    const prompt = `You are an HR manager evaluating a candidate for a ${jobTitle} role in the ${industry} sector. Based on the following job interview responses, provide a short review of the candidate's performance. Highlight 1–2 strengths and 1 area for improvement. Be encouraging and helpful.

${formattedTranscript}`;

    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an HR professional providing feedback on job interviews." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const openAIData = await openAIResponse.json();
    
    if (!openAIResponse.ok) {
      console.error("OpenAI API error:", openAIData);
      return new Response(
        JSON.stringify({ error: "Failed to generate feedback" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract the feedback from OpenAI's response
    const feedback = openAIData.choices[0].message.content;

    // Return the generated feedback
    return new Response(
      JSON.stringify({ 
        feedback,
        session_id: sessionId,
        user_responses: transcript
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        } 
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
