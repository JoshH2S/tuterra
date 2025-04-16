
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
