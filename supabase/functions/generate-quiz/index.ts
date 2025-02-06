import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseContent, topics } = await req.json();
    console.log('Received request with topics:', topics);

    // Format the prompt for quiz generation
    const prompt = `
      Based on the following course content, generate quiz questions for these topics:
      ${topics.map((t: any) => `${t.name} (${t.questionCount} questions)`).join(', ')}

      Course Content:
      ${courseContent}

      For each topic, generate the exact number of questions specified.
      Each question should:
      1. Be clear and unambiguous
      2. Have a specific, correct answer
      3. Be relevant to the topic and course content

      Format your response as a JSON array where each question object has:
      {
        "question": "the question text",
        "correct_answer": "the correct answer",
        "topic": "the topic name"
      }

      Make sure to generate exactly ${topics.reduce((acc: number, t: any) => acc + t.questionCount, 0)} questions total.
    `;

    console.log('Sending request to OpenAI...');

    // Call OpenAI API
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
            content: 'You are an expert at creating educational quiz questions. Generate clear, focused questions with specific, unambiguous answers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('Received response from OpenAI:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let generatedQuestions;
    try {
      generatedQuestions = JSON.parse(data.choices[0].message.content);
      console.log('Successfully parsed questions:', generatedQuestions);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Failed to parse generated questions');
    }

    // Validate the response format
    if (!Array.isArray(generatedQuestions)) {
      throw new Error('Generated questions must be an array');
    }

    // Validate each question has required fields
    generatedQuestions.forEach((q: any, index: number) => {
      if (!q.question || !q.correct_answer || !q.topic) {
        throw new Error(`Question at index ${index} is missing required fields`);
      }
    });

    return new Response(JSON.stringify({ questions: generatedQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate quiz questions. Please try again.'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});