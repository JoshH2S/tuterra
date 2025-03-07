
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

// Define interface for interview questions
interface InterviewQuestion {
  id: string;
  text: string; // Changed from 'question' to 'text'
  category: string;
  difficulty: string;
  estimatedTimeSeconds: number;
  keywords?: string[];
  question_order: number;
  created_at: string;
}

// Define interface for request body
interface RequestBody {
  industry: string;
  role?: string;
  jobRole?: string;
  jobDescription?: string;
  sessionId: string;
}

// Define interface for response body
interface ResponseBody {
  success: boolean;
  sessionId: string;
  questions: InterviewQuestion[];
}

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
const validateRequest = (body: any): body is RequestBody => {
  console.log("Validating request body:", JSON.stringify(body));
  
  if (!body) {
    throw new Error('Request body is missing or empty');
  }
  
  // Check for both 'role' and 'jobRole' parameters to handle both naming conventions
  const role = body.role || body.jobRole;
  
  if (!body.industry || !role || !body.sessionId) {
    throw new Error(`Missing required fields: ${[
      !body.industry && 'industry',
      !role && 'role/jobRole',
      !body.sessionId && 'sessionId'
    ].filter(Boolean).join(', ')}`);
  }

  return true;
};

serve(async (req) => {
  // Log request method and headers for debugging
  console.log("Function called: generate-interview-questions");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request (CORS preflight)");
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse request body
    let reqBody;
    try {
      console.log("Attempting to parse request body...");
      
      if (req.bodyUsed) {
        console.error("Request body already consumed");
        return new Response(
          JSON.stringify({ 
            error: "Request body already consumed",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Check if the content type is correct
      const contentType = req.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid content type:", contentType);
        return new Response(
          JSON.stringify({ 
            error: "Invalid content type. Expected application/json",
            receivedContentType: contentType
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      const bodyText = await req.text();
      console.log("Raw request body:", bodyText);
      
      if (!bodyText || bodyText.trim() === "") {
        console.error("Empty request body");
        return new Response(
          JSON.stringify({ 
            error: "Empty request body",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      try {
        reqBody = JSON.parse(bodyText);
        console.log("Request body parsed successfully:", JSON.stringify(reqBody));
      } catch (parseError) {
        console.error("Failed to parse request body:", parseError);
        return new Response(
          JSON.stringify({ 
            error: "Invalid request format: could not parse JSON body",
            details: parseError.message,
            receivedBody: bodyText
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    } catch (error) {
      console.error("Error handling request body:", error);
      return new Response(
        JSON.stringify({ 
          error: "Error handling request body",
          details: error.message
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Validate request
    try {
      validateRequest(reqBody);
    } catch (validationError) {
      console.error("Request validation failed:", validationError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format or missing required fields",
          details: validationError.message,
          received: JSON.stringify(reqBody)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Support both role and jobRole parameters
    const { industry, role, jobRole, jobDescription, sessionId } = reqBody;
    const effectiveRole = role || jobRole; // Use either parameter name
    
    console.log("Processed parameters:", { 
      industry, 
      role: effectiveRole,
      jobDescription: jobDescription ? jobDescription.substring(0, 50) + "..." : "N/A",
      sessionId
    });
    
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
      role: effectiveRole, 
      jobDescription: jobDescription ? jobDescription.substring(0, 50) + "..." : "N/A" 
    });
    
    // Generate the questions with updated format
    const questions = generateInterviewQuestions(industry, effectiveRole, jobDescription);
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

// Generate interview questions based on industry, job role, and description
// Updated to match client-expected format
function generateInterviewQuestions(industry: string, role: string, jobDescription?: string): InterviewQuestion[] {
  const currentDate = new Date().toISOString();
  const baseQuestions: InterviewQuestion[] = [
    {
      id: `q-${crypto.randomUUID()}`,
      text: `Tell me about your experience as a ${role} in the ${industry} industry.`,
      category: "experience",
      difficulty: "medium",
      estimatedTimeSeconds: 120,
      keywords: [role.toLowerCase(), industry.toLowerCase(), "experience"],
      question_order: 0,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      text: `What skills do you have that make you a good fit for this ${role} position?`,
      category: "skills",
      difficulty: "medium",
      estimatedTimeSeconds: 90,
      keywords: [role.toLowerCase(), "skills", "qualifications"],
      question_order: 1,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      text: `Describe a challenging situation you've faced in a previous role and how you handled it.`,
      category: "behavioral",
      difficulty: "hard",
      estimatedTimeSeconds: 150,
      keywords: ["challenge", "problem-solving", "experience"],
      question_order: 2,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      text: `How do you stay updated with trends and changes in the ${industry} industry?`,
      category: "industry knowledge",
      difficulty: "medium",
      estimatedTimeSeconds: 100,
      keywords: [industry.toLowerCase(), "trends", "professional development"],
      question_order: 3,
      created_at: currentDate
    },
    {
      id: `q-${crypto.randomUUID()}`,
      text: `Where do you see yourself professionally in five years?`,
      category: "career goals",
      difficulty: "medium",
      estimatedTimeSeconds: 90,
      keywords: ["goals", "career development", "ambition"],
      question_order: 4,
      created_at: currentDate
    }
  ];
  
  // Add industry-specific questions
  if (industry.toLowerCase() === 'technology' || industry.toLowerCase() === 'tech') {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      text: "Describe a technical project you worked on that you're particularly proud of.",
      category: "technical experience",
      difficulty: "hard",
      estimatedTimeSeconds: 150,
      keywords: ["project", "technical", "achievement"],
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase() === 'finance') {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      text: "How do you ensure accuracy and attention to detail in your financial work?",
      category: "attention to detail",
      difficulty: "medium",
      estimatedTimeSeconds: 120,
      keywords: ["finance", "accuracy", "detail-oriented"],
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase() === 'healthcare') {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      text: "How do you balance patient care with administrative responsibilities?",
      category: "balance",
      difficulty: "hard",
      estimatedTimeSeconds: 140,
      keywords: ["healthcare", "patient care", "administration"],
      question_order: 5,
      created_at: currentDate
    });
  }
  
  // Add role-specific questions
  if (role.toLowerCase().includes('manager') || role.toLowerCase().includes('leader')) {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      text: "Describe your management style and how you motivate your team.",
      category: "leadership",
      difficulty: "hard",
      estimatedTimeSeconds: 150,
      keywords: ["management", "leadership", "team motivation"],
      question_order: 6,
      created_at: currentDate
    });
  } else if (role.toLowerCase().includes('engineer') || role.toLowerCase().includes('developer')) {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      text: "How do you approach debugging and troubleshooting complex technical issues?",
      category: "problem solving",
      difficulty: "hard",
      estimatedTimeSeconds: 150,
      keywords: ["debugging", "troubleshooting", "technical"],
      question_order: 6,
      created_at: currentDate
    });
  } else if (role.toLowerCase().includes('analyst')) {
    baseQuestions.push({
      id: `q-${crypto.randomUUID()}`,
      text: "Describe how you would approach analyzing a complex dataset to extract meaningful insights.",
      category: "analytical skills",
      difficulty: "hard",
      estimatedTimeSeconds: 160,
      keywords: ["analysis", "data", "insights"],
      question_order: 6,
      created_at: currentDate
    });
  }
  
  return baseQuestions;
}
