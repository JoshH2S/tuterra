
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

// Initialize Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// CORS headers for browser requests
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
    const { sessionId, transcript } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get the interview session details
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("id, job_title, industry, job_description")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Interview session not found", details: sessionError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Format transcript for OpenAI
    const formattedTranscript = transcript.map((item: any) => 
      `Question: ${item.question}\nAnswer: ${item.answer}`
    ).join("\n\n");

    // Create the prompt for OpenAI
    const prompt = `You are an HR specialist evaluating a candidate's job interview responses for a ${session.job_title} in the ${session.industry} sector. Based on their answers, provide constructive feedback. Mention 1-2 strengths and 1 area for improvement. Be concise and helpful.

Interview Transcript:
${formattedTranscript}

Job Description:
${session.job_description || "No job description provided"}`;

    // Call OpenAI API
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an HR specialist providing constructive feedback on job interview responses."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const openAiData = await openAiResponse.json();
    const feedback = openAiData.choices[0].message.content.trim();

    // Get the user ID from the session (for the internship_progress table)
    const { data: userSession, error: userError } = await supabase
      .from("interview_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();

    if (userError || !userSession) {
      console.error("Error getting user ID:", userError);
      throw new Error("Could not determine user ID");
    }

    // Check if an internship session already exists for this interview
    const { data: existingInternship } = await supabase
      .from("internship_sessions")
      .select("id")
      .eq("user_id", userSession.user_id)
      .eq("job_title", session.job_title)
      .eq("industry", session.industry)
      .maybeSingle();

    let internshipSessionId;
    
    if (existingInternship) {
      // Update existing internship session
      internshipSessionId = existingInternship.id;
      await supabase
        .from("internship_sessions")
        .update({ current_phase: 1 })
        .eq("id", internshipSessionId);
    } else {
      // Create new internship session
      const { data: newInternship, error: internshipError } = await supabase
        .from("internship_sessions")
        .insert({
          user_id: userSession.user_id,
          job_title: session.job_title,
          industry: session.industry,
          job_description: session.job_description,
          current_phase: 1
        })
        .select()
        .single();

      if (internshipError || !newInternship) {
        console.error("Error creating internship session:", internshipError);
        throw new Error("Failed to create internship session");
      }
      
      internshipSessionId = newInternship.id;
    }

    // Store responses and feedback in internship_progress
    const { data: progress, error: progressError } = await supabase
      .from("internship_progress")
      .insert({
        user_id: userSession.user_id,
        session_id: sessionId,
        phase_number: 1,
        user_responses: JSON.stringify(transcript),
        ai_feedback: feedback
      })
      .select()
      .single();

    if (progressError) {
      console.error("Error storing internship progress:", progressError);
      throw new Error("Failed to store internship progress");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        feedback,
        internshipSessionId,
        progressId: progress.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error generating feedback:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
