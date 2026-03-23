import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { RequestBody, EdgeFunctionResponse } from "./types.ts";
import { corsHeaders, createSuccessResponse, createErrorResponse, validateRequest, verifySessionExists, adminSupabase } from "./utils.ts";
import { extractRequirements } from "./requirementsExtractor.ts";
import { generateEnhancedQuestions } from "./questionGenerator.ts";
import { generateBasicInterviewQuestions } from "./fallbackQuestions.ts";
// ─── Practice requirements (inlined to avoid bundler module-not-found issues) ─

const getRoleSignals = (jobTitle: string): string[] => {
  const t = jobTitle.toLowerCase();
  if (t.includes("engineer") || t.includes("developer") || t.includes("programmer")) {
    return [
      "Ability to explain technical decisions, tradeoffs, and implementation choices",
      "Experience debugging production issues and improving code quality",
      "Knowledge of system design, scalability, or architecture appropriate to the role level",
      "Strong collaboration with product, design, and engineering teammates",
    ];
  }
  if (t.includes("manager") || t.includes("lead") || t.includes("director")) {
    return [
      "Ability to prioritize work, manage tradeoffs, and align teams around goals",
      "Experience leading people, projects, or cross-functional initiatives",
      "Clear communication with stakeholders, executives, and team members",
      "Strong decision-making under ambiguity and changing priorities",
    ];
  }
  if (t.includes("analyst") || t.includes("data") || t.includes("business intelligence")) {
    return [
      "Ability to analyze complex datasets and translate findings into decisions",
      "Experience using relevant analytical tools, reporting methods, or dashboards",
      "Strong communication of insights to non-technical stakeholders",
      "Clear thinking around metrics, business questions, and recommendations",
    ];
  }
  if (t.includes("designer") || t.includes("design") || t.includes("ux") || t.includes("ui")) {
    return [
      "Ability to explain design decisions and connect them to user needs",
      "Experience balancing user research, design quality, and delivery constraints",
      "Strong collaboration with product, engineering, and stakeholders",
      "Confidence discussing portfolio work, iteration, and feedback handling",
    ];
  }
  if (t.includes("marketing") || t.includes("growth") || t.includes("sales")) {
    return [
      "Ability to explain campaign, pipeline, or growth strategies with clear results",
      "Experience using performance metrics to guide decisions and optimization",
      "Strong communication tailored to customers, prospects, or stakeholders",
      "Comfort balancing creativity with measurable business outcomes",
    ];
  }
  return [
    "Ability to explain relevant experience, strengths, and achievements clearly",
    "Strong problem-solving and decision-making in realistic work situations",
    "Good communication, collaboration, and stakeholder management",
    "Evidence of learning quickly and adapting to role expectations",
  ];
};

const buildPracticeRequirements = (
  jobTitle: string,
  industry?: string,
  additionalContext?: string,
): string[] => {
  const normalizedIndustry = industry?.trim();
  const trimmedContext = additionalContext?.trim();
  return [
    `Role: ${jobTitle}`,
    ...(normalizedIndustry ? [`Industry: ${normalizedIndustry}`] : []),
    "Tailor questions to the core responsibilities and expectations of this role",
    ...getRoleSignals(jobTitle),
    ...(trimmedContext ? [`Additional practice context: ${trimmedContext}`] : []),
  ];
};

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Initialize Supabase client with admin rights
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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
      
      // First check if the content type is correct
      const contentType = req.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid content type:", contentType);
        return createErrorResponse({ 
          message: "Invalid content type. Expected application/json",
          receivedContentType: contentType
        }, 400);
      }
      
      // Clone the request to avoid consuming the body which can only be read once
      const clonedReq = req.clone();
      const bodyText = await clonedReq.text();
      console.log("Raw request body:", bodyText);
      
      if (!bodyText || bodyText.trim() === "") {
        console.error("Empty request body");
        return createErrorResponse({ 
          message: "Empty request body. Please ensure the request includes a JSON payload.",
          requestDetails: {
            method: req.method,
            contentType: contentType,
            url: req.url
          }
        }, 400);
      }
      
      try {
        reqBody = JSON.parse(bodyText);
        console.log("Request body parsed successfully:", JSON.stringify(reqBody));
      } catch (parseError) {
        console.error("Failed to parse request body:", parseError);
        return createErrorResponse({ 
          message: "Invalid request format: could not parse JSON body",
          details: parseError.message,
          receivedBody: bodyText
        }, 400);
      }
    } catch (error) {
      console.error("Error handling request body:", error);
      return createErrorResponse({
        message: "Error handling request body",
        details: error.message
      }, 400);
    }
    
    // Validate request
    try {
      validateRequest(reqBody);
    } catch (validationError) {
      console.error("Request validation failed:", validationError);
      return createErrorResponse({ 
        message: "Invalid request format or missing required fields",
        details: validationError.message,
        received: JSON.stringify(reqBody)
      }, 400);
    }
    
    // Extract parameters - standardize on jobTitle
    const { industry, jobTitle, jobDescription, sessionId, practiceMode } = reqBody;
    
    console.log("Processed parameters:", { 
      industry, 
      jobTitle,
      jobDescription: jobDescription ? jobDescription.substring(0, 50) + "..." : "N/A",
      sessionId,
      practiceMode
    });
    
    // For testing quickly without session verification - comment out in production
    if (sessionId === "test-123") {
      console.log("Test session ID detected, bypassing session verification");
      const questions = generateBasicInterviewQuestions(industry, jobTitle, jobDescription);
      
      return createSuccessResponse({ 
        success: true, 
        sessionId, 
        questions
      });
    }
    
    // Verify session exists in database with enhanced retry logic
    console.log(`Verifying session ${sessionId} exists in database with enhanced retry logic`);
    const sessionExists = await verifySessionExists(sessionId, 4, 800);

    if (!sessionExists) {
      console.error("Session not found after maximum retries:", sessionId);
      return createErrorResponse({ 
        message: "Session not found",
        sessionId,
        suggestion: "Please try again or create a new interview session"
      }, 404);
    }
    
    console.log(`Session verified. Generating enhanced questions for session ${sessionId}`);
    let questions: EdgeFunctionResponse["questions"] = [];
    let requirements: string[] = [];

    try {
      const hasDetailedJobDescription = !!jobDescription && jobDescription.trim().length > 50;

      // 1. Extract key requirements from job description when preparing for a real posting.
      if (practiceMode !== "general-practice" && hasDetailedJobDescription) {
        requirements = await extractRequirements(jobTitle, industry, jobDescription);
        console.log(`Extracted ${requirements.length} key requirements from job description`);
      } else {
        requirements = buildPracticeRequirements(jobTitle, industry, jobDescription);
        console.log("Using synthesized role-based requirements for interview generation");
      }

      // 2. Generate enhanced questions based on requirements
      questions = await generateEnhancedQuestions(jobTitle, industry, requirements, jobDescription);
      console.log(`Generated ${questions.length} enhanced questions`);
    } catch (aiError) {
      console.error("Error in AI-based question generation:", aiError);
      console.log("Falling back to basic question generation");
      questions = generateBasicInterviewQuestions(industry, jobTitle, jobDescription);
    }
    
    // Try to update session with both ID and session_id for maximum compatibility
    console.log("Updating session with generated questions");
    
    try {
      // First try to update using id column (primary key)
      const { error: updateError } = await supabase
        .from('interview_sessions')
        .update({ 
          questions,
          job_description: jobDescription || null
        })
        .eq('id', sessionId);
      
      if (updateError) {
        console.error("Error updating session with primary key (id):", updateError);
        
        // If that fails, try with session_id column
        const { error: fallbackUpdateError } = await adminSupabase
          .from('interview_sessions')
          .update({ 
            questions,
            job_description: jobDescription || null
          })
          .eq('session_id', sessionId);
        
        if (fallbackUpdateError) {
          console.error("Error also updating with session_id:", fallbackUpdateError);
          return createErrorResponse({ 
            message: "Failed to update session with questions",
            operation: "update session with questions",
            sessionId
          }, 500);
        }
      }
      
      console.log("Successfully updated session with questions");
      return createSuccessResponse({ 
        success: true, 
        sessionId, 
        questions
      });
    } catch (error) {
      console.error("Error in database update:", error);
      return createErrorResponse({ 
        message: "Database error",
        operation: "update session with questions",
        details: error.message
      }, 500);
    }
    
  } catch (error) {
    console.error("Error processing request:", error);
    return createErrorResponse(error);
  }
});
