
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { QuestionRequest, questionGenerator } from "./questionGenerator.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: QuestionRequest = await req.json();

    if (!request.industry || !request.role) {
      console.error('Missing required fields:', { industry: request.industry, role: request.role });
      return new Response(
        JSON.stringify({ error: 'Industry and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating questions for session ${request.sessionId}`);
    const questions = await questionGenerator.generateQuestions(request);

    console.log(`Generated ${questions.length} questions successfully`);

    return new Response(
      JSON.stringify({ 
        questions: questions,
        metadata: {
          totalTime: questions.reduce((sum, q) => sum + (q.estimatedTimeSeconds || 0), 0),
          questionCount: questions.length
        }  
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error handling request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        stack: error.stack
      }),
      { 
        status: error.status || 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
