
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
    const { quizResponseId, correctAnswers, totalQuestions, score, questionResponses, topicPerformance } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the quiz questions to analyze topics and patterns
    const { data: responseData, error: responseError } = await supabase
      .from('quiz_responses')
      .select(`
        *,
        quiz:quizzes(
          title,
          quiz_questions(
            question,
            correct_answer,
            topic,
            options
          )
        )
      `)
      .eq('id', quizResponseId)
      .single();

    if (responseError) throw responseError;

    const percentage = (correctAnswers / totalQuestions) * 100;
    const questions = responseData.quiz.quiz_questions;
    
    // Generate feedback using GPT
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an educational assistant providing detailed, constructive feedback on quiz performance. Focus on specific topics and provide actionable advice.'
          },
          {
            role: 'user',
            content: `
              Please analyze this quiz performance and provide specific, actionable feedback:
              
              Quiz Title: ${responseData.quiz.title}
              Overall Score: ${score}
              Correct Answers: ${correctAnswers}
              Total Questions: ${totalQuestions}
              Overall Percentage: ${percentage}%

              Topic Performance:
              ${topicPerformance.map(t => 
                `${t.topic}: ${t.correct}/${t.total} (${t.percentage.toFixed(1)}%)`
              ).join('\n')}

              Question Details:
              ${questions.map((q, i) => {
                const response = questionResponses.find(r => r.question_id === q.id);
                return `
                  Q${i + 1}. Topic: ${q.topic}
                  Question: ${q.question}
                  Correct Answer: ${q.correct_answer}
                  Student Answer: ${response?.student_answer || 'Not answered'}
                  Result: ${response?.is_correct ? 'Correct' : 'Incorrect'}
                `;
              }).join('\n')}

              Provide feedback in this JSON format:
              {
                "strengths": ["specific strength point based on topics performed well in"],
                "areas_for_improvement": ["specific improvement point based on topics that need work"],
                "advice": "detailed advice paragraph focusing on how to improve in the weaker topics and maintain performance in stronger ones"
              }

              Make the feedback specific to the actual topics, questions, and performance shown in the data.
            `
          }
        ]
      })
    });

    const aiResponse = await openAIResponse.json();
    console.log("AI Response:", aiResponse);
    
    let feedback;
    try {
      feedback = JSON.parse(aiResponse.choices[0].message.content);
    } catch (e) {
      console.error("Error parsing AI response:", e);
      feedback = {
        strengths: ["Unable to analyze strengths at this time"],
        areas_for_improvement: ["Unable to analyze areas for improvement at this time"],
        advice: "Please try again later for detailed feedback"
      };
    }

    // Update the quiz response with AI feedback
    const { error: updateError } = await supabase
      .from('quiz_responses')
      .update({ 
        ai_feedback: feedback,
        topic_performance: topicPerformance || responseData.topic_performance
      })
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
