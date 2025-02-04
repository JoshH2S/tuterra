import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, objectives } = await req.json();

    const prompt = `
      As an expert educator, create a detailed lesson plan based on the following content and objectives:

      Content:
      ${content}

      Learning Objectives:
      ${objectives.map((obj: any, index: number) => 
        `${index + 1}. ${obj.description} (Duration: ${obj.days} days)`
      ).join('\n')}

      Please provide a structured lesson plan that includes:
      1. Clear learning outcomes
      2. Detailed daily activities and teaching strategies
      3. Required materials and resources
      4. Assessment methods and success criteria
      5. Differentiation strategies for diverse learners
      6. Homework or extension activities

      Format the response in a clear, organized structure.
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
          { 
            role: 'system', 
            content: 'You are an expert educator with experience in curriculum development and lesson planning. Provide detailed, practical, and engaging lesson plans.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const lessonPlan = data.choices[0].message.content;

    return new Response(JSON.stringify({ lessonPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-lesson-plan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});