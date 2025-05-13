
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { transcript, jobTitle, industry, isInternship = false } = await req.json();

    if (!transcript || !jobTitle || !industry) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate transcript format
    if (!Array.isArray(transcript) || !transcript.length) {
      return new Response(
        JSON.stringify({ error: 'Invalid transcript format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create prompt for feedback
    let promptContent = isInternship 
      ? `You are an HR manager evaluating a candidate for a ${jobTitle} role in the ${industry} sector. Based on the following interview responses, provide 1-2 strengths and 1 constructive improvement. Be helpful and encouraging.`
      : `You are a professional interview coach reviewing a practice interview for a ${jobTitle} position in the ${industry} industry. Provide detailed feedback on the candidate's responses.`;

    // Format transcript for the prompt
    const formattedTranscript = transcript.map((t, i) => 
      `Question ${i + 1}: ${t.question}\nCandidate's Answer: ${t.answer}\n`
    ).join('\n');

    // Call OpenAI API for feedback generation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: promptContent },
          { role: 'user', content: formattedTranscript }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const gptResponse = await response.json();

    if (gptResponse.error) {
      console.error('OpenAI API error:', gptResponse.error);
      throw new Error('Error generating feedback with OpenAI');
    }

    const feedbackContent = gptResponse.choices[0].message.content;
    
    // Extract strengths and areas for improvement using simple parsing
    let strengths = [];
    let improvements = [];
    
    // Simple parsing - can be enhanced for better accuracy
    const strengthsMatch = feedbackContent.match(/Strengths?:?(.*?)(?:Areas? for improvement|Improvement opportunities?|$)/is);
    const improvementsMatch = feedbackContent.match(/(?:Areas? for improvement|Improvement opportunities?):?(.*?)$/is);
    
    if (strengthsMatch && strengthsMatch[1]) {
      strengths = strengthsMatch[1]
        .split(/(?:\d+\.)|\n/)
        .map(s => s.trim())
        .filter(Boolean);
    }
    
    if (improvementsMatch && improvementsMatch[1]) {
      improvements = improvementsMatch[1]
        .split(/(?:\d+\.)|\n/)
        .map(s => s.trim())
        .filter(Boolean);
    }
    
    // Return structured feedback
    return new Response(
      JSON.stringify({ 
        feedback: {
          overall_feedback: feedbackContent.trim(),
          strengths: strengths.length ? strengths : [],
          areas_for_improvement: improvements.length ? improvements : [],
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-interview-feedback function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error generating feedback' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
