
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

// Validate environment at startup
const validateEnvironment = () => {
  const required = ['OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !Deno.env.get(key));
  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};

validateEnvironment();

// Initialize Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate request body
const validateRequest = (body: any) => {
  const required = ['industry', 'jobRole', 'sessionId'];
  const missing = required.filter(key => !body[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  if (typeof body.industry !== 'string' || 
      typeof body.jobRole !== 'string' || 
      typeof body.sessionId !== 'string') {
    throw new Error('Invalid parameter types');
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
    console.log("Function called: generate-interview-questions");
    
    // Parse and validate request body
    let reqBody;
    try {
      reqBody = await req.json();
      console.log("Request body:", JSON.stringify(reqBody));
      validateRequest(reqBody);
    } catch (parseError) {
      console.error("Invalid request format or validation failed:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format or missing required fields",
          details: parseError.message,
          received: reqBody || "No body"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { industry, jobRole, jobDescription, sessionId } = reqBody;
    
    // Verify session exists in database before proceeding
    console.log(`Verifying session ${sessionId} exists in database`);
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();
    
    if (sessionError || !sessionData) {
      console.error("Session verification failed:", sessionError || "Session not found");
      return new Response(
        JSON.stringify({ 
          error: "Invalid session ID or session not found",
          sessionId,
          dbError: sessionError?.message || "Session not found in database"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    console.log(`Session verified. Generating questions for session ${sessionId}`);
    console.log("Parameters:", { 
      industry, 
      jobRole, 
      jobDescription: jobDescription ? jobDescription.substring(0, 50) + "..." : "N/A" 
    });
    
    // Generate the questions
    const questions = generateMockQuestions(industry, jobRole, jobDescription);
    console.log(`Generated ${questions.length} questions`);
    
    // Save the questions to the database
    console.log("Updating session with generated questions");
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({ questions })
      .eq('session_id', sessionId);
    
    if (updateError) {
      console.error("Error updating session with questions:", updateError);
      return new Response(
        JSON.stringify({ 
          error: updateError.message,
          operation: "update session with questions",
          sessionId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log("Successfully updated session with questions");
    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionId, 
        questions
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        timestamp: new Date().toISOString(),
        stack: error.stack?.split("\n").slice(0, 3).join("\n") || "No stack trace"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Generate mock questions based on industry, job role, and description
function generateMockQuestions(industry: string, jobRole: string, jobDescription?: string) {
  const currentDate = new Date().toISOString();
  const baseQuestions = [
    {
      id: `q-${crypto.randomUUID()}`,
      question: `Tell me about your experience as a ${jobRole} in the ${industry} industry.`,
      question_order: 0,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      question: `What skills do you have that make you a good fit for this ${jobRole} position?`,
      question_order: 1,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      question: `Describe a challenging situation you've faced in a previous role and how you handled it.`,
      question_order: 2,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      question: `How do you stay updated with trends and changes in the ${industry} industry?`,
      question_order: 3,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      question: `Where do you see yourself professionally in five years?`,
      question_order: 4,
      created_at: currentDate
    }
  ];
  
  // Add industry-specific questions
  if (industry.toLowerCase() === 'technology' || industry.toLowerCase() === 'tech') {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "Describe a technical project you worked on that you're particularly proud of.",
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase() === 'finance') {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "How do you ensure accuracy and attention to detail in your financial work?",
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase() === 'healthcare') {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "How do you balance patient care with administrative responsibilities?",
      question_order: 5,
      created_at: currentDate
    });
  }
  
  // Add role-specific questions
  if (jobRole.toLowerCase().includes('manager') || jobRole.toLowerCase().includes('leader')) {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "Describe your management style and how you motivate your team.",
      question_order: 6,
      created_at: currentDate
    });
  } else if (jobRole.toLowerCase().includes('engineer') || jobRole.toLowerCase().includes('developer')) {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "How do you approach debugging and troubleshooting complex technical issues?",
      question_order: 6,
      created_at: currentDate
    });
  } else if (jobRole.toLowerCase().includes('analyst')) {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      question: "Describe how you would approach analyzing a complex dataset to extract meaningful insights.",
      question_order: 6,
      created_at: currentDate
    });
  }
  
  return baseQuestions;
}
