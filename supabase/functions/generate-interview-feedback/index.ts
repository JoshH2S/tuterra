
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { industry, role, jobDescription, questions, userResponses } = await req.json();

    if (!questions || !userResponses || questions.length !== userResponses.length) {
      return new Response(
        JSON.stringify({ error: 'Valid questions and responses are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a transcript of the interview for the AI to analyze
    let transcriptText = "";
    for (let i = 0; i < questions.length; i++) {
      transcriptText += `Question ${i + 1}: ${questions[i]}\n`;
      transcriptText += `Candidate's Response: ${userResponses[i]}\n\n`;
    }

    const prompt = `
      You are an expert job interview coach. Below is a transcript of a job interview for a ${role} position in the ${industry} industry.
      
      ${jobDescription ? `The job description is: ${jobDescription}\n\n` : ''}
      
      Interview Transcript:
      ${transcriptText}
      
      Please provide comprehensive feedback on this interview, addressing:
      1. Overall impression
      2. Strengths demonstrated by the candidate
      3. Areas for improvement
      4. Specific examples from their responses
      5. Suggestions for better answers where applicable
      
      Format your feedback in a helpful, constructive manner that would be valuable for the candidate.
    `;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an experienced job interview coach providing constructive feedback on interview performance. Be specific, helpful, and encouraging.' 
          },
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

    const feedback = data.choices?.[0]?.message?.content?.trim();
    
    if (!feedback) {
      throw new Error('No feedback generated');
    }
    
    return new Response(
      JSON.stringify({ feedback }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating feedback:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
