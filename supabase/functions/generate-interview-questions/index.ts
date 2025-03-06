
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
    const { industry, jobRole, jobDescription, sessionId } = await req.json();
    
    if (!industry || !jobRole || !jobDescription || !sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Generating questions for ${jobRole} in ${industry}`);
    
    // Generate questions with OpenAI
    const promptText = `
    You are an interviewer for a ${jobRole} position in the ${industry} industry.
    Generate 5 relevant interview questions based on the following job description:
    
    ${jobDescription}
    
    Your questions should be challenging but fair, and should assess the candidate's skills and experience for this role.
    Format the output as a JSON array of question strings only, without any additional text.
    `;
    
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates job interview questions." },
        { role: "user", content: promptText }
      ],
      temperature: 0.7,
    });
    
    const responseText = completion.data.choices[0]?.message?.content || "[]";
    
    // Parse the response to extract the questions
    let questions;
    try {
      // The response might be formatted in different ways, so we handle various formats
      const cleaned = responseText.replace(/```json|```/g, "").trim();
      
      // Check if it's already an array or needs to be extracted from a JSON object
      if (cleaned.startsWith("[")) {
        questions = JSON.parse(cleaned);
      } else if (cleaned.startsWith("{")) {
        const parsed = JSON.parse(cleaned);
        questions = parsed.questions || parsed;
      } else {
        // If not valid JSON, try to extract questions line by line
        questions = responseText
          .split("\n")
          .filter(line => line.trim().startsWith('"') || line.trim().startsWith("'"))
          .map(line => line.trim().replace(/^["']|["']$/g, "").replace(/["'],?$/g, ""));
      }
      
      // Ensure questions is an array of strings
      if (!Array.isArray(questions)) {
        throw new Error("Response is not a valid array");
      }
    } catch (error) {
      console.error("Error parsing questions:", error);
      
      // Fallback: Try to extract questions from the text
      questions = responseText
        .split("\n")
        .filter(line => /^\d+[\.\)]\s+/.test(line))
        .map(line => line.replace(/^\d+[\.\)]\s+/, ""));
      
      if (questions.length === 0) {
        return new Response(
          JSON.stringify({ error: "Failed to parse questions from AI response" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }
    
    // Save questions to the database
    const questionsData = [];
    
    for (let i = 0; i < questions.length; i++) {
      const { data, error } = await supabase
        .from('interview_questions')
        .insert({
          session_id: sessionId,
          question: questions[i],
          question_order: i
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error saving question:", error);
        continue;
      }
      
      questionsData.push(data);
    }
    
    return new Response(
      JSON.stringify({ questions: questionsData }),
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
