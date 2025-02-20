
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
    const { topic } = await req.json();

    if (!topic) {
      throw new Error('Topic is required');
    }

    const prompt = `
      Create a case study-based quiz about ${topic}. The quiz should:
      1. Reference recent real-world events and developments
      2. Focus on analysis and implications rather than just facts
      3. Include questions about potential future impacts
      4. Incorporate key terminology and concepts
      5. Encourage critical thinking about the topic

      Format your response as a pure JSON array with questions that have these properties:
      - question: the actual question text
      - options: an array of 4 options labeled A, B, C, and D
      - correctAnswer: one of "A", "B", "C", or "D"
      - topic: which aspect of the topic this question relates to
      - points: number of points for this question (1 point for each)

      Generate 5 multiple-choice questions following this format.
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
            content: 'You are an expert at creating case study based quizzes that focus on analysis and implications.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    if (content.includes('```')) {
      content = content.replace(/```json\n|\n```|```/g, '');
    }

    const quizQuestions = JSON.parse(content);

    return new Response(JSON.stringify({ quizQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-case-study-quiz:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
