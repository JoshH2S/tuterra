
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { responses, questions, role, industry, jobDescription } = await req.json();

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No responses provided for analysis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the conversation transcript
    let transcriptText = "";
    for (let i = 0; i < Math.min(questions.length, responses.length); i++) {
      transcriptText += `Interviewer: ${questions[i]}\n`;
      transcriptText += `Candidate: ${responses[i]}\n\n`;
    }

    // If there are more responses than questions, add them too
    if (responses.length > questions.length) {
      for (let i = questions.length; i < responses.length; i++) {
        transcriptText += `Candidate additional response: ${responses[i]}\n\n`;
      }
    }

    const prompt = `
      You are an expert job interview coach. You need to analyze the following job interview transcript for a ${role} position in the ${industry} industry.
      
      ${jobDescription ? `Job Description: ${jobDescription}\n\n` : ''}
      
      Interview Transcript:
      ${transcriptText}
      
      Please provide constructive feedback for the candidate, including:
      1. The candidate's strengths shown in the interview
      2. Areas for improvement
      3. Specific advice for future interviews for similar positions
      
      Format your response as a JSON object with the following structure:
      {
        "strengths": ["strength1", "strength2", ...],
        "areas_for_improvement": ["area1", "area2", ...],
        "advice": "Your specific advice..."
      }
      
      The JSON should be valid and contain only these fields.
    `;

    // Call OpenAI API for analysis
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert job interview coach providing specific, constructive feedback. Your analysis should be balanced, highlighting both strengths and areas for improvement.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Unknown error from OpenAI API');
    }

    const responseContent = data.choices?.[0]?.message?.content?.trim() || '';
    
    // Parse the JSON from the response
    try {
      const feedback = JSON.parse(responseContent);
      
      // Validate the structure
      if (!feedback.strengths || !feedback.areas_for_improvement || !feedback.advice) {
        throw new Error('Response does not have the expected structure');
      }
      
      return new Response(
        JSON.stringify({ feedback }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI response:', parseError);
      console.log('Raw response:', responseContent);
      
      // Fallback: create a structured response manually
      const fallbackFeedback = {
        strengths: ["Provided detailed responses", "Showed enthusiasm for the role"],
        areas_for_improvement: ["Could provide more specific examples", "Consider structuring answers with the STAR method"],
        advice: "Overall, you've demonstrated good communication skills. For future interviews, prepare more specific examples that showcase your experience relevant to the role."
      };
      
      return new Response(
        JSON.stringify({ feedback: fallbackFeedback }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
