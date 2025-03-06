
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

// Validate environment at startup
const validateEnvironment = () => {
  const required = ['OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !Deno.env.get(key));
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Call environment validation
validateEnvironment();

// Fallback questions if OpenAI fails
const getFallbackQuestions = (jobRole: string, industry: string) => [
  {
    text: `Tell me about your experience as a ${jobRole}.`,
    category: 'experience',
    difficulty: 'medium',
    estimatedTimeSeconds: 120
  },
  {
    text: `What interests you about working in ${industry}?`,
    category: 'motivation',
    difficulty: 'easy',
    estimatedTimeSeconds: 90
  },
  {
    text: `Describe a challenging situation you've faced in a previous role and how you handled it.`,
    category: 'behavioral',
    difficulty: 'medium',
    estimatedTimeSeconds: 180
  },
  {
    text: `What specific skills do you have that make you qualified for this ${jobRole} position?`,
    category: 'skills',
    difficulty: 'medium',
    estimatedTimeSeconds: 120
  },
  {
    text: `Where do you see yourself professionally in five years?`,
    category: 'career',
    difficulty: 'medium',
    estimatedTimeSeconds: 120
  }
];

// Question generator class
class QuestionGenerator {
  async generateQuestions(industry: string, jobRole: string, jobDescription: string) {
    console.log(`Generating questions for ${jobRole} in ${industry}`);
    
    // Generate questions with OpenAI using a more structured prompt
    const promptText = `
    Generate exactly 5 interview questions for a ${jobRole} position in ${industry}.
    Job Description: ${jobDescription}

    Return ONLY a JSON array of question strings.
    DO NOT include any explanations, numbering, or additional text.
    The output should be a valid JSON array like this: ["question 1", "question 2", "question 3", "question 4", "question 5"]
    `;
    
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are an AI that generates structured interview questions. Always respond with valid JSON arrays containing question strings."
          },
          { role: "user", content: promptText }
        ],
        temperature: 0.7,
      });
      
      const responseText = completion.data.choices[0]?.message?.content || "[]";
      console.log("Raw OpenAI response:", responseText);
      
      return this.parseQuestions(responseText, industry, jobRole);
    } catch (error) {
      console.error("Error generating questions with OpenAI:", error);
      // Return fallback questions instead of throwing an error
      return getFallbackQuestions(jobRole, industry).map(q => q.text);
    }
  }
  
  parseQuestions(responseText: string, industry: string, jobRole: string) {
    try {
      // Try multiple parsing approaches
      
      // Approach 1: Direct JSON parsing
      try {
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log("Successfully parsed as JSON array");
          return parsed;
        }
        
        // Check if it's an object with a questions property
        if (parsed.questions && Array.isArray(parsed.questions)) {
          console.log("Successfully parsed object with questions array");
          return parsed.questions;
        }
      } catch (e) {
        console.log("Direct JSON parsing failed, trying other methods");
      }
      
      // Approach 2: Find JSON array in text
      const arrayMatch = responseText.match(/\[\s*".*"\s*(?:,\s*".*"\s*)*\]/s);
      if (arrayMatch) {
        try {
          const parsedArray = JSON.parse(arrayMatch[0]);
          if (Array.isArray(parsedArray) && parsedArray.length > 0) {
            console.log("Successfully extracted and parsed JSON array from text");
            return parsedArray;
          }
        } catch (e) {
          console.log("JSON array extraction failed");
        }
      }
      
      // Approach 3: Line-by-line parsing
      const lines = responseText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('```') && !line.startsWith('[') && !line.startsWith(']'));
      
      if (lines.length > 0) {
        console.log("Parsing line by line");
        const questions = lines
          .map(line => {
            // Remove numbering, quotes and other formatting
            return line
              .replace(/^\d+[\.\)\s]+/, '') // Remove numbering
              .replace(/^["'`]|["'`]$/g, '') // Remove quotes
              .replace(/,$/, '') // Remove trailing comma
              .trim();
          })
          .filter(line => line.length > 10); // Must be a reasonable length
        
        if (questions.length > 0) {
          console.log("Successfully parsed questions line by line");
          return questions;
        }
      }
      
      // If all parsing attempts fail, return fallback questions
      console.log("All parsing methods failed, using fallback questions");
      return getFallbackQuestions(jobRole, industry).map(q => q.text);
    } catch (error) {
      console.error("Error parsing questions:", error);
      return getFallbackQuestions(jobRole, industry).map(q => q.text);
    }
  }
}

// Batch save questions to the database
const saveQuestions = async (questions: string[], sessionId: string) => {
  const questionsData = [];
  
  try {
    const { data, error } = await supabase
      .from('interview_questions')
      .insert(
        questions.map((question, i) => ({
          session_id: sessionId,
          question: question,
          question_order: i
        }))
      )
      .select();
    
    if (error) {
      console.error("Error batch saving questions:", error);
      
      // Fall back to individual inserts if batch insert fails
      for (let i = 0; i < questions.length; i++) {
        const { data: individualData, error: individualError } = await supabase
          .from('interview_questions')
          .insert({
            session_id: sessionId,
            question: questions[i],
            question_order: i
          })
          .select()
          .single();
        
        if (individualError) {
          console.error("Error saving individual question:", individualError);
          continue;
        }
        
        questionsData.push(individualData);
      }
      
      return questionsData;
    }
    
    return data;
  } catch (error) {
    console.error("Database error saving questions:", error);
    throw error;
  }
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
        JSON.stringify({ 
          error: "Missing required parameters",
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    // Generate questions
    const generator = new QuestionGenerator();
    const questions = await generator.generateQuestions(industry, jobRole, jobDescription);
    
    if (!questions || questions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate questions",
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }
    
    console.log(`Generated ${questions.length} questions for session ${sessionId}`);
    
    // Save questions to the database
    const savedQuestions = await saveQuestions(questions, sessionId);
    
    return new Response(
      JSON.stringify({ 
        questions: savedQuestions,
        metadata: {
          count: savedQuestions.length,
          generated: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
