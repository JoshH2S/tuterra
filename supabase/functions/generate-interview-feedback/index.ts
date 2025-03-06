
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { sessionId, transcript } = await req.json();

    if (!sessionId || !transcript || !Array.isArray(transcript)) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get session details
    const { data: sessionData, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
      
    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch interview session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Connect to OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format transcript for the prompt
    const transcriptText = transcript.map((item, i) => 
      `Question ${i+1}: ${item.question}\nAnswer: ${item.answer}`
    ).join('\n\n');

    // Generate feedback with OpenAI
    const prompt = `
      You are an expert interviewer and career coach reviewing a job interview for a ${sessionData.job_role} position in the ${sessionData.industry} industry.
      
      I need you to analyze the following interview transcript and provide detailed feedback:
      
      ${transcriptText}
      
      Provide a comprehensive analysis using the following format:
      1. A paragraph of overall feedback about the interview performance (250-300 words)
      2. 3-5 specific strengths demonstrated in the responses
      3. 3-5 specific areas for improvement
      4. An overall score from 1-10
      
      Return the response as JSON in exactly this format without any additional text:
      {
        "feedback": "Overall feedback paragraph here...",
        "strengths": ["Strength 1", "Strength 2", ...],
        "areas_for_improvement": ["Area 1", "Area 2", ...],
        "overall_score": 7
      }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that provides interview feedback.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to generate feedback with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const feedbackContent = data.choices[0].message.content;
    let feedbackData;
    
    try {
      // Parse the JSON from the AI response
      feedbackData = JSON.parse(feedbackContent);
    } catch (error) {
      console.error('Error parsing feedback JSON:', error);
      console.log('Raw content:', feedbackContent);
      
      // Fallback: try to extract JSON using regex
      const jsonMatch = feedbackContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          feedbackData = JSON.parse(jsonMatch[0]);
        } catch (innerError) {
          console.error('Failed to parse JSON with regex:', innerError);
          return new Response(
            JSON.stringify({ error: 'Failed to parse feedback from AI response' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Failed to parse feedback from AI response' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Insert feedback into the database
    const { data: insertedFeedback, error: insertError } = await supabase
      .from('interview_feedback')
      .insert({
        session_id: sessionId,
        feedback: feedbackData.feedback,
        strengths: feedbackData.strengths,
        areas_for_improvement: feedbackData.areas_for_improvement,
        overall_score: feedbackData.overall_score
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        feedback: insertedFeedback 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-interview-feedback function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
