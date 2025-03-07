
// Utility functions for the generate-interview-questions edge function

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Create a success response with proper headers
export function createSuccessResponse(data: any, status = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status 
    }
  );
}

// Create an error response with proper headers
export function createErrorResponse(error: any, status = 500): Response {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  return new Response(
    JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 3).join("\n") : "No stack trace"
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status 
    }
  );
}

// Validate request body
export function validateRequest(body: any): body is RequestBody {
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
}
