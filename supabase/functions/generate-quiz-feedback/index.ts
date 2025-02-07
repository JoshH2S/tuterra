
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quizResponseId, correctAnswers, totalQuestions, score, questionResponses } = await req.json();

    const percentage = (correctAnswers / totalQuestions) * 100;

    // Generate feedback using GPT
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an educational assistant providing constructive feedback on quiz performance.'
          },
          {
            role: 'user',
            content: `
              Please analyze this quiz performance and provide feedback:
              - Score: ${score}
              - Correct Answers: ${correctAnswers}
              - Total Questions: ${totalQuestions}
              - Percentage: ${percentage}%

              Provide feedback in this JSON format:
              {
                "strengths": ["point 1", "point 2"],
                "areas_for_improvement": ["point 1", "point 2"],
                "advice": "detailed advice paragraph"
              }
            `
          }
        ]
      })
    });

    const aiResponse = await openAIResponse.json();
    const feedback = JSON.parse(aiResponse.choices[0].message.content);

    // Update the quiz response with AI feedback
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabase
      .from('quiz_responses')
      .update({ ai_feedback: feedback })
      .eq('id', quizResponseId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ message: 'Feedback generated and saved successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz-feedback:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
