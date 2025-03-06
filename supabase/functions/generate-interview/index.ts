
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
    const { sessionId, jobTitle, industry, jobDescription, questionCount = 5 } = await req.json();
    
    if (!sessionId || !jobTitle || !industry) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Generating interview questions for ${jobTitle} in ${industry}`);
    
    // Generate questions with OpenAI
    const promptText = `
    You are an expert interviewer for ${industry} jobs. 
    Create ${questionCount} interview questions for a ${jobTitle} position.
    ${jobDescription ? `The job description is: ${jobDescription}` : ''}
    
    Provide questions that assess both technical skills and soft skills.
    Return ONLY a JSON array of strings, each string being a question. No additional text.
    `;
    
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional interviewer that creates challenging job interview questions." },
        { role: "user", content: promptText }
      ],
      temperature: 0.7,
    });
    
    const responseText = completion.data.choices[0]?.message?.content || "[]";
    
    // Parse the response to extract the questions
    let questions;
    try {
      // Clean the response text to ensure it's valid JSON
      const cleaned = responseText.replace(/```json|```/g, "").trim();
      questions = JSON.parse(cleaned);
      
      if (!Array.isArray(questions)) {
        throw new Error("Expected an array of questions");
      }
    } catch (error) {
      console.error("Error parsing questions:", error);
      
      // Fallback to predefined questions if parsing fails
      questions = [
        `Tell me about your experience as a ${jobTitle} in the ${industry} industry.`,
        `What skills do you think are most important for a ${jobTitle} role?`,
        `Describe a challenging situation you've faced in a previous role and how you handled it.`,
        `How do you stay updated with trends and changes in the ${industry} industry?`,
        `Where do you see yourself professionally in five years?`
      ];
    }
    
    // Save the questions to the database
    const questionInserts = questions.map((question, index) => ({
      session_id: sessionId,
      question: question,
      question_order: index
    }));
    
    const { data: insertedQuestions, error: insertError } = await supabase
      .from('interview_questions')
      .insert(questionInserts)
      .select();
    
    if (insertError) {
      console.error("Error saving questions:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save questions", details: insertError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Update session status to 'ready'
    await supabase
      .from('interview_sessions')
      .update({ status: 'in_progress' })
      .eq('id', sessionId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        questions: insertedQuestions 
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
