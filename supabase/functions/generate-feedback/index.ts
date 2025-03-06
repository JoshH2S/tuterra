
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.3.0";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

// Initialize OpenAI
const configuration = new Configuration({ apiKey: openaiApiKey });
const openai = new OpenAIApi(configuration);

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
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing session ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Generating feedback for interview session ${sessionId}`);
    
    // Get session details including questions and responses
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Failed to find interview session" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Get questions for this session
    const { data: questions, error: questionsError } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true });
    
    if (questionsError || !questions) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve interview questions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Get responses for each question
    const questionIds = questions.map(q => q.id);
    const { data: responses, error: responsesError } = await supabase
      .from('interview_responses')
      .select('*')
      .in('question_id', questionIds);
    
    if (responsesError) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve interview responses" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Build a consolidated transcript of the interview
    const responseMap = responses ? responses.reduce((acc, response) => {
      acc[response.question_id] = response.response;
      return acc;
    }, {}) : {};
    
    let transcript = "";
    questions.forEach((question, index) => {
      transcript += `Question ${index + 1}: ${question.question}\n`;
      transcript += `Answer: ${responseMap[question.id] || "No answer provided"}\n\n`;
    });
    
    // Generate feedback with OpenAI
    const promptText = `
    You are an expert interview coach. Review the following job interview transcript for a ${session.job_title} position in the ${session.industry} industry and provide constructive feedback:
    
    ${transcript}
    
    Provide feedback in JSON format with the following structure:
    {
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "weaknesses": ["Area 1", "Area 2", "Area 3"],
      "tips": ["Specific advice 1", "Specific advice 2", "Specific advice 3"],
      "overallFeedback": "Overall assessment and advice"
    }
    `;
    
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
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
    const { data: feedback, error: feedbackError } = await supabase
      .from('interview_feedback')
      .insert({
        session_id: sessionId,
        strengths: feedbackData.strengths || [],
        weaknesses: feedbackData.weaknesses || [],
        tips: feedbackData.tips || [],
        overall_feedback: feedbackData.overallFeedback || ""
      })
      .select()
      .single();
    
    if (feedbackError) {
      console.error("Error saving feedback:", feedbackError);
      return new Response(
        JSON.stringify({ error: "Failed to save feedback to the database" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Update session status to completed
    await supabase
      .from('interview_sessions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);
    
    return new Response(
      JSON.stringify({ success: true, feedback }),
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
