
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { industry, role, jobDescription } = await req.json();

    if (!industry || !role) {
      return new Response(
        JSON.stringify({ error: 'Industry and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `
      Generate 5-7 realistic job interview questions for a ${role} position in the ${industry} industry.
      
      ${jobDescription ? `Here is the job description: ${jobDescription}` : ''}
      
      Create questions that are:
      1. Relevant to the skills, experience, and qualifications required for this position
      2. Progressive in difficulty (start with basic questions, move to more complex ones)
      3. A mix of:
         - Technical/skill-based questions
         - Behavioral questions
         - Situational questions
         - Role-specific questions
      
      Format your response as a JSON array of strings, each containing one interview question.
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
            content: 'You are an expert AI interviewer that generates realistic job interview questions. Your output should be a valid JSON array of strings, each containing one interview question. Questions should progress from basic to more complex.' 
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

    const responseContent = data.choices?.[0]?.message?.content?.trim() || '';
    
    // Parse the JSON from the response
    try {
      const questions = JSON.parse(responseContent);
      
      // Ensure it's an array of strings
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      return new Response(
        JSON.stringify({ questions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI response:', parseError);
      console.log('Raw response:', responseContent);
      
      // Fallback: try to extract questions manually using a regex
      const questionMatches = responseContent.match(/"([^"]+)"/g);
      if (questionMatches && questionMatches.length > 0) {
        const questions = questionMatches.map(q => q.replace(/"/g, ''));
        return new Response(
          JSON.stringify({ questions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Last resort: return an error
      throw new Error('Could not parse questions from response');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
