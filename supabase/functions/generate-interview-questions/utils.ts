
// Utility functions for the generate-interview-questions edge function

// Define the expected request body structure
export interface RequestBody {
  industry: string;
  jobTitle: string; // Primary parameter is jobTitle
  jobDescription?: string;
  sessionId: string;
}

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
  
  // Check for industry
  if (!body.industry || typeof body.industry !== 'string' || body.industry.trim() === '') {
    throw new Error('Missing or invalid industry field');
  }
  
  // Check for session ID
  if (!body.sessionId || typeof body.sessionId !== 'string' || body.sessionId.trim() === '') {
    throw new Error('Missing or invalid sessionId field');
  }
  
  // First check for jobTitle directly
  if (body.jobTitle && typeof body.jobTitle === 'string' && body.jobTitle.trim() !== '') {
    return true;
  }
  
  // For backward compatibility, check legacy parameters
  const legacyRole = body.role || body.jobRole;
  if (legacyRole && typeof legacyRole === 'string' && legacyRole.trim() !== '') {
    console.log("Using legacy parameter (role/jobRole) instead of jobTitle");
    // Assign the legacy role to jobTitle for consistent processing
    body.jobTitle = legacyRole.trim();
    return true;
  }
  
  throw new Error('Missing or invalid job title field');
}
