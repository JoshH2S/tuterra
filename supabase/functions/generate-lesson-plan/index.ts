
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const MAX_CONTENT_LENGTH = 5000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, objectives, teacherName, school } = await req.json();

    if (!content || !objectives) {
      throw new Error('Missing required parameters: content and objectives');
    }

    const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);
    console.log('Processing request with content length:', trimmedContent.length);
    console.log('Number of objectives:', objectives.length);

    const prompt = `
      As an expert educator, create a detailed lesson plan based on the following content and objectives.
      Format your response in plain text without any special characters, markdown symbols, or formatting (no #, *, -, or other symbols).
      Use numbers and letters for organization, and separate sections with blank lines.

      Teacher Information:
      Teacher: ${teacherName || 'Not specified'}
      School: ${school || 'Not specified'}

      Content:
      ${trimmedContent}

      Learning Objectives:
      ${objectives.map((obj: any, index: number) => 
        `${index + 1}. ${obj.description} (Duration: ${obj.days} days)`
      ).join('\n')}

      Please provide a structured lesson plan that includes:
      1. Learning Outcomes
      2. Daily Activities and Teaching Strategies
      3. Required Materials and Resources
      4. Assessment Methods
      5. Differentiation Strategies
      6. Homework Activities

      Format everything in plain text with clear numbering and lettering for organization.
      Do not use any special characters or markdown formatting.
    `;

    console.log('Sending request to OpenAI API');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert educator. Provide lesson plans in plain text format only, without any markdown or special formatting characters. Use simple numbers and letters for organization.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI API');

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Invalid response format from OpenAI API');
    }

    const lessonPlan = data.choices[0].message.content;

    return new Response(JSON.stringify({ lessonPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-lesson-plan function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
