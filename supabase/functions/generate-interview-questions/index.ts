
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

// Question generator class
class QuestionGenerator {
  async generateQuestions(industry: string, jobRole: string, jobDescription: string) {
    console.log(`Generating questions for ${jobRole} in ${industry}`);
    
    // Generate questions with OpenAI
    const promptText = `
    You are an interviewer for a ${jobRole} position in the ${industry} industry.
    Generate 5 relevant interview questions based on the following job description:
    
    ${jobDescription}
    
    Your questions should be challenging but fair, and should assess the candidate's skills and experience for this role.
    Return ONLY an array of strings, with each string being a question. No additional text or explanation.
    `;
    
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates job interview questions." },
          { role: "user", content: promptText }
        ],
        temperature: 0.7,
      });
      
      const responseText = completion.data.choices[0]?.message?.content || "[]";
      console.log("Raw OpenAI response:", responseText);
      
      // Parse the response to extract the questions
      let questions = [];
      try {
        // Clean the response - remove code blocks markers and whitespace
        const cleaned = responseText.replace(/```json|```|\[|\]/g, "").trim();
        
        // Split by line, removing empty lines and numbered prefixes
        questions = cleaned
          .split("\n")
          .map(line => line.trim())
          .filter(line => line && line.length > 0)
          .map(line => {
            // Remove quotation marks, numbers, and other formatting
            return line
              .replace(/^["'\d\.\)\s]+|["'\s,]+$/g, "")  // Remove starting/ending quotes and numbers
              .trim();
          });
          
        console.log("Parsed questions:", questions);
        
        // Ensure we have at least one question
        if (questions.length === 0) {
          // Fallback: just split by newlines and hope for the best
          questions = responseText
            .split("\n")
            .map(line => line.trim())
            .filter(line => line && line.length > 5);
        }
        
        // Make sure there are no blank questions
        questions = questions.filter(q => q && q.length > 5);
        
        // If still no questions, throw error to trigger fallback
        if (questions.length === 0) {
          throw new Error("Could not parse any valid questions");
        }
      } catch (error) {
        console.error("Error parsing questions, using fallback method:", error);
        
        // Fallback: Try to extract questions as plain text
        questions = [
          `Tell me about your experience in ${industry}.`,
          `What skills do you have that make you a good fit for the ${jobRole} role?`,
          `Describe a challenging situation you've faced in a previous role and how you handled it.`,
          `Why are you interested in this ${jobRole} position?`,
          `What are your career goals and how does this position align with them?`
        ];
      }
      
      return questions;
    } catch (error) {
      console.error("Error generating questions with OpenAI:", error);
      throw error;
    }
  }
}

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
    
    // Generate questions
    const generator = new QuestionGenerator();
    const questions = await generator.generateQuestions(industry, jobRole, jobDescription);
    
    console.log(`Generated ${questions.length} questions for session ${sessionId}`);
    
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
