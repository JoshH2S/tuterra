
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userAnswer, correctAnswer, isCorrect, topic } = await req.json();

    const prompt = `
      As an educational AI assistant, provide a brief, encouraging explanation for a quiz answer.
      
      Context:
      - Question: ${question}
      - Student's Answer: ${userAnswer}
      - Correct Answer: ${correctAnswer}
      - Topic: ${topic}
      - Result: ${isCorrect ? 'Correct' : 'Incorrect'}

      Provide a 2-3 sentence explanation that:
      1. Acknowledges the student's answer
      2. Explains why it's correct/incorrect
      3. Reinforces the key concept from ${topic}
      4. Maintains an encouraging tone

      Keep the explanation concise and educational.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful educational assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Error generating explanation');
    }

    const explanation = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ explanation }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in generate-explanation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        explanation: "We couldn't generate a detailed explanation at this time." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
