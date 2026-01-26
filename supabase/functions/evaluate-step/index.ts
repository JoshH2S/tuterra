import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EvaluateStepRequest {
  step_id: string;
  course_id: string;
  submission: {
    answers?: { [questionId: string]: string };
    text?: string;
    response?: string;
    reflections?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = claimsData.user.id;

    const { step_id, course_id, submission }: EvaluateStepRequest = await req.json();

    if (!step_id || !course_id || !submission) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch step details
    const { data: step, error: stepError } = await supabase
      .from('module_steps')
      .select('*, course_modules!inner(*, generated_courses!inner(*))')
      .eq('id', step_id)
      .single();

    if (stepError || !step) {
      return new Response(
        JSON.stringify({ error: 'Step not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const course = step.course_modules.generated_courses;
    const module = step.course_modules;

    console.log('Evaluating step:', step.title, 'Type:', step.step_type);

    // Get previous attempt count
    const { count: attemptCount } = await supabase
      .from('step_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('step_id', step_id)
      .eq('user_id', userId);

    const attemptNumber = (attemptCount || 0) + 1;

    let feedback;
    let score = null;
    let isPassing = true;

    // Handle different step types
    if (step.step_type === 'quiz' || step.step_type === 'checkpoint') {
      // Auto-grade quiz/checkpoint with multiple choice
      if (submission.answers && step.content.questions) {
        let correctCount = 0;
        const totalQuestions = step.content.questions.length;
        
        step.content.questions.forEach((q: any) => {
          if (submission.answers?.[q.id] === q.correctAnswer) {
            correctCount++;
          }
        });

        score = Math.round((correctCount / totalQuestions) * 100);
        const passingScore = module.checkpoints_schema?.passingScore || 70;
        isPassing = score >= passingScore;

        feedback = {
          overallScore: score,
          feedback: isPassing 
            ? `Great job! You scored ${score}% (${correctCount}/${totalQuestions} correct).`
            : `You scored ${score}% (${correctCount}/${totalQuestions} correct). You need ${passingScore}% to pass. Review the material and try again!`,
          strengths: isPassing ? ['Good understanding of key concepts'] : [],
          improvements: isPassing ? [] : ['Review the module content before retrying'],
          nextStepGuidance: isPassing 
            ? 'You can proceed to the next step!' 
            : 'Take time to review the teaching sections before retrying.'
        };
      }
    } else if (step.step_type === 'prompt' || (step.step_type === 'checkpoint' && submission.text)) {
      // Use AI to evaluate written responses
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
      
      if (openAIApiKey && (submission.text || submission.response)) {
        const userResponse = submission.text || submission.response || '';
        
        const evaluationPrompt = `You are evaluating a student's response in an educational course.

Course: ${course.topic} (${course.level} level)
Module: ${module.title}
Step: ${step.title}

Question/Prompt: ${step.content.question || step.content.instructions || 'Complete the reflection.'}
Expected Response Criteria: ${step.content.expectedResponse || 'Thoughtful engagement with the material'}

Student's Response:
"${userResponse}"

${step.rubric ? `Evaluation Rubric: ${JSON.stringify(step.rubric)}` : ''}

Provide feedback in this JSON format:
{
  "overallScore": <number 0-100>,
  "feedback": "Constructive feedback paragraph (2-3 sentences, no markdown)",
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "improvements": ["Suggestion 1", "Suggestion 2"],
  "nextStepGuidance": "What the student should do next",
  "conceptsToReview": ["Concept 1", "Concept 2"] // if score < 70
}

Be encouraging but honest. Focus on learning, not criticism.`;

        try {
          const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  content: 'You are a supportive educational evaluator. Always respond with valid JSON only.'
                },
                {
                  role: 'user',
                  content: evaluationPrompt
                }
              ],
              temperature: 0.5,
              max_tokens: 800,
            }),
          });

          if (openAIResponse.ok) {
            const openAIData = await openAIResponse.json();
            const generatedFeedback = openAIData.choices[0]?.message?.content;
            
            if (generatedFeedback) {
              const cleanedFeedback = generatedFeedback
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
              feedback = JSON.parse(cleanedFeedback);
              score = feedback.overallScore;
              isPassing = score >= 60; // Lower threshold for prompts
            }
          }
        } catch (aiError) {
          console.error('AI evaluation error:', aiError);
        }
      }
      
      // Fallback if AI evaluation fails
      if (!feedback) {
        feedback = {
          overallScore: 80,
          feedback: 'Thank you for your thoughtful response. Your engagement with the material shows understanding.',
          strengths: ['Completed the response'],
          improvements: ['Continue exploring the topic'],
          nextStepGuidance: 'You can proceed to the next step!'
        };
        score = 80;
        isPassing = true;
      }
    } else if (step.step_type === 'teach') {
      // Teach steps don't need evaluation
      feedback = {
        feedback: 'Content reviewed. Continue to the next step!',
        nextStepGuidance: 'Proceed to the next step.'
      };
      isPassing = true;
    } else if (step.step_type === 'reflection') {
      // Auto-pass reflections with minimal feedback
      feedback = {
        feedback: 'Thank you for your reflection. Taking time to think about what you\'ve learned strengthens retention.',
        strengths: ['Engaged in self-reflection'],
        nextStepGuidance: 'Continue to the next step!'
      };
      isPassing = true;
    }

    // Save the submission
    const { data: savedSubmission, error: submissionError } = await supabase
      .from('step_submissions')
      .insert({
        step_id,
        user_id: userId,
        course_id,
        submission,
        ai_feedback: feedback,
        score,
        is_passing: isPassing,
        attempt_number: attemptNumber
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Error saving submission:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Failed to save submission' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update step completion if passing
    if (isPassing) {
      await supabase
        .from('module_steps')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', step_id);

      // Update progress
      const { data: allSteps } = await supabase
        .from('module_steps')
        .select('id, is_completed, step_type')
        .eq('module_id', module.id);

      const completedSteps = allSteps?.filter(s => s.is_completed).length || 0;
      const totalSteps = allSteps?.length || 0;
      const completedCheckpoints = allSteps?.filter(s => s.is_completed && s.step_type === 'checkpoint').length || 0;

      await supabase
        .from('course_progress')
        .update({
          current_step_id: step_id,
          total_steps_completed: completedSteps,
          total_checkpoints_passed: completedCheckpoints,
          last_activity_at: new Date().toISOString()
        })
        .eq('course_id', course_id)
        .eq('user_id', userId);

      // Check if module is complete
      if (completedSteps === totalSteps) {
        await supabase
          .from('course_modules')
          .update({ is_completed: true, completed_at: new Date().toISOString() })
          .eq('id', module.id);
      }
    }

    // Find next step
    let nextStepId = null;
    if (isPassing) {
      const { data: nextStep } = await supabase
        .from('module_steps')
        .select('id')
        .eq('module_id', module.id)
        .gt('step_index', step.step_index)
        .order('step_index', { ascending: true })
        .limit(1)
        .maybeSingle();

      nextStepId = nextStep?.id || null;
    }

    return new Response(
      JSON.stringify({
        success: true,
        submission: savedSubmission,
        feedback,
        score,
        is_passing: isPassing,
        next_step_id: nextStepId,
        attempt_number: attemptNumber
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
