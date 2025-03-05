
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { industry, role, jobDescription, previousQuestions, userResponses } = await req.json();

    if (!industry || !role) {
      return new Response(
        JSON.stringify({ error: 'Industry and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a context-aware prompt based on previous interactions
    const contextPrompt = previousQuestions && userResponses 
      ? `Previous questions asked: ${previousQuestions.join(', ')}\nUser responses: ${userResponses.join(', ')}\n\n`
      : '';

    const prompt = `
      Generate 5-7 realistic job interview questions for a ${role} position in the ${industry} industry.
      
      ${jobDescription ? `Here is the job description: ${jobDescription}` : ''}
      
      ${contextPrompt}
      
      Create questions that are:
      1. Relevant to the skills, experience, and qualifications required for this position
      2. Progressive in difficulty (start with basic questions, move to more complex ones)
      3. Contextually aware of previous questions and responses
      4. A mix of:
         - Technical/skill-based questions
         - Behavioral questions
         - Situational questions
         - Role-specific questions
      
      Format your response as a JSON array of strings, each containing one interview question.
      Each question should be unique and build upon previous interactions.
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
            content: 'You are an expert AI interviewer that generates realistic, contextual job interview questions. Your output should be a valid JSON array of strings, each containing one interview question. Questions should be progressive and build upon previous interactions.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await openaiResponse.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const questions = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify({ questions }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
