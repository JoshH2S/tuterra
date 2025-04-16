
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { RequestBody, EdgeFunctionResponse } from "./types.ts";
import { corsHeaders, createSuccessResponse, createErrorResponse, validateRequest } from "./utils.ts";
import { extractRequirements } from "./requirementsExtractor.ts";
import { generateEnhancedQuestions } from "./questionGenerator.ts";
import { generateBasicInterviewQuestions } from "./fallbackQuestions.ts";

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
    const { industry, jobTitle, jobDescription, sessionId } = reqBody;
    
    console.log("Processed parameters:", { 
      industry, 
      jobTitle,
      jobDescription: jobDescription ? jobDescription.substring(0, 50) + "..." : "N/A",
      sessionId
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
    
    // Verify session exists in database before proceeding
    console.log(`Verifying session ${sessionId} exists in database`);
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, session_id')
      .eq('session_id', sessionId)
      .maybeSingle();

    console.log("Session verification result:", { 
      sessionData, 
      sessionError,
      requestedSessionId: sessionId 
    });

    if (sessionError) {
      console.error("Session verification failed:", sessionError);
      return createErrorResponse({ 
        message: "Failed to verify session",
        details: sessionError.message,
        sessionId 
      }, 500);
    }

    if (!sessionData) {
      console.error("Session not found:", sessionId);
      return createErrorResponse({ 
        message: "Session not found",
        sessionId,
        suggestion: "Session may still be propagating, please try again"
      }, 404);
    }
    
    console.log(`Session verified. Generating enhanced questions for session ${sessionId}`);
    let questions = [];
    let requirements = [];

    try {
      // 1. Extract key requirements from job description if available
      if (jobDescription && jobDescription.trim().length > 50) {
        requirements = await extractRequirements(jobTitle, industry, jobDescription);
        console.log(`Extracted ${requirements.length} key requirements from job description`);
      } else {
        requirements = [`Role: ${jobTitle}`, `Industry: ${industry}`];
        console.log("No detailed job description provided, using basic requirements");
      }

      // 2. Generate enhanced questions based on requirements
      questions = await generateEnhancedQuestions(jobTitle, industry, requirements, jobDescription);
      console.log(`Generated ${questions.length} enhanced questions`);
    } catch (aiError) {
      console.error("Error in AI-based question generation:", aiError);
      console.log("Falling back to basic question generation");
      questions = generateBasicInterviewQuestions(industry, jobTitle, jobDescription);
    }
    
    // Save the questions to the database
    console.log("Updating session with generated questions");
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({ 
        questions,
        job_description: jobDescription || null
      })
      .eq('session_id', sessionId);
    
    if (updateError) {
      console.error("Error updating session with questions:", updateError);
      return createErrorResponse({ 
        message: updateError.message,
        operation: "update session with questions",
        sessionId
      }, 500);
    }
    
    console.log("Successfully updated session with questions");
    return createSuccessResponse({ 
      success: true, 
      sessionId, 
      questions
    });
    
  } catch (error) {
    console.error("Error processing request:", error);
    return createErrorResponse(error);
  }
});
