
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

// Enhanced session verification with more gradual backoff and detailed logging
export async function verifySessionExists(sessionId: string, maxRetries = 4, initialDelay = 800): Promise<boolean> {
  console.log(`Starting verification for session ${sessionId} with ${maxRetries} attempts`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Verification attempt ${attempt} of ${maxRetries} for session ${sessionId}`);
    
    try {
      // First try with id column (primary key)
      const { data: sessionData, error: sessionError } = await adminSupabase
        .from('interview_sessions')
        .select('id, session_id, job_title, industry')
        .eq('id', sessionId)
        .maybeSingle();
        
      if (sessionError) {
        console.error(`Database error on verification attempt ${attempt}:`, sessionError);
      } else if (sessionData) {
        console.log(`Session ${sessionId} verified successfully on attempt ${attempt}:`, sessionData);
        return true;
      } else {
        console.log(`Session not found using id column on attempt ${attempt}, trying session_id column`);
        
        // Double-check using session_id as fallback (just in case)
        const { data: fallbackData } = await adminSupabase
          .from('interview_sessions')
          .select('id')
          .eq('session_id', sessionId)
          .maybeSingle();
          
        if (fallbackData) {
          console.log(`Session found using fallback lookup (session_id column) with ID: ${fallbackData.id}`);
          return true;
        }
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
  
  console.log(`Session ${sessionId} could not be verified after ${maxRetries} attempts`);
  return false;
}
