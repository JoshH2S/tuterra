
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateQuestions(
  fileUrl: string,
  topics: { name: string; questionCount: number }[]
): Promise<any> {
  if (!Array.isArray(topics) || topics.length === 0 || !topics.every(t => t.name && t.questionCount > 0)) {
    console.error('Invalid topics provided:', { topics });
    throw new Error('Invalid topics provided for question generation');
  }

  console.log('Generating questions for file:', fileUrl);
  console.log('Topics:', topics);

  const prompt = `You are a quiz generator. Create a quiz based on the content from the provided file.
Please focus on these topics:
${topics.map((topic, index) => `${index + 1}. ${topic.name} (${topic.questionCount} questions)`).join('\n')}

Requirements:
1. Each question must test understanding, not just recall
2. Each question must have exactly four answer options labeled A, B, C, and D
3. One option must be correct, three must be plausible but incorrect
4. Questions must directly reference the content
5. Avoid obvious incorrect answers

Format each question as a JSON object with:
{
  "question": "the question text",
  "options": {
    "A": "first option",
    "B": "second option",
    "C": "third option",
    "D": "fourth option"
  },
  "correct_answer": "A/B/C/D",
  "topic": "the topic name"
}

Return an array of these question objects.`;

  try {
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const questions = JSON.parse(data.choices[0].message.content);
    console.log(`Generated ${questions.length} questions successfully`);
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    if (!requestData.fileId || !requestData.topics) {
      throw new Error('Missing required fields: fileId and topics are required');
    }

    if (!Array.isArray(requestData.topics) || requestData.topics.length === 0) {
      throw new Error('Topics must be a non-empty array');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

    // Get file URL from storage
    const { data: { publicUrl }, error: urlError } = supabase
      .storage
      .from('course_materials')
      .getPublicUrl(requestData.fileId);

    if (urlError || !publicUrl) {
      console.error('Error getting file URL:', urlError);
      throw new Error('Failed to get file URL');
    }

    // Generate questions using the file URL
    const questions = await generateQuestions(publicUrl, requestData.topics);
    
    // Deduplicate questions
    const uniqueQuestions = Array.from(new Set(questions.map(q => JSON.stringify(q))))
      .map(q => JSON.parse(q));

    console.log(`Returning ${uniqueQuestions.length} unique questions`);

    return new Response(
      JSON.stringify({ questions: uniqueQuestions }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
