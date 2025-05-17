
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Initialize Supabase client with admin rights
export const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// CORS headers
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const createSuccessResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
};

export const createErrorResponse = (error: any, status = 500) => {
  console.error("Error:", error);
  
  return new Response(
    JSON.stringify({
      error: error.message || "An unexpected error occurred",
      details: error.details || error,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    }
  );
};

export const validateRequest = (body: any) => {
  if (!body) {
    throw new Error("Request body is missing");
  }
  
  if (!body.sessionId) {
    throw new Error("Session ID is required");
  }
  
  if (!body.industry) {
    throw new Error("Industry is required");
  }
  
  if (!body.jobTitle) {
    throw new Error("Job title is required");
  }
};

// Enhanced session verification with checking in both tables
export async function verifySessionExists(sessionId: string, maxRetries = 4, initialDelay = 800): Promise<boolean> {
  console.log(`Starting verification for session ${sessionId} with ${maxRetries} attempts`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Verification attempt ${attempt} of ${maxRetries} for session ${sessionId}`);
    
    try {
      // First try with interview_sessions table (job interview)
      const { data: jobSessionData, error: jobSessionError } = await adminSupabase
        .from('interview_sessions')
        .select('id, session_id, job_title, industry')
        .eq('id', sessionId)
        .maybeSingle();
        
      if (jobSessionData) {
        console.log(`Session ${sessionId} verified successfully in interview_sessions on attempt ${attempt}:`, jobSessionData);
        return true;
      }
      
      // Try with session_id column for interview_sessions
      const { data: jobSessionFallbackData } = await adminSupabase
        .from('interview_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();
        
      if (jobSessionFallbackData) {
        console.log(`Session found in interview_sessions using session_id column with ID: ${jobSessionFallbackData.id}`);
        return true;
      }
      
      // Next, try with internship_sessions table (internship)
      const { data: internshipSessionData, error: internshipSessionError } = await adminSupabase
        .from('internship_sessions')
        .select('id, job_title, industry')
        .eq('id', sessionId)
        .maybeSingle();
        
      if (internshipSessionData) {
        console.log(`Session ${sessionId} verified successfully in internship_sessions on attempt ${attempt}:`, internshipSessionData);
        return true;
      }
      
      if (attempt < maxRetries) {
        // Use more gradual backoff: 800ms, 1200ms, 1800ms, etc.
        const backoffDelay = initialDelay * (1 + (attempt - 1) * 0.5);
        console.log(`Waiting ${backoffDelay}ms before next verification attempt...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    } catch (error) {
      console.error(`Unexpected error during verification attempt ${attempt}:`, error);
    }
  }
  
  console.log(`Session ${sessionId} could not be verified after ${maxRetries} attempts in either tables`);
  return false;
}
