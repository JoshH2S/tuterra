
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  createSupabaseClient, 
  analyzeQuizResponses, 
  updateStudentProfile 
} from "./helpers.ts";
import { generateFeedback } from "./feedbackGenerator.ts";
import { QuizResponse, AIFeedback } from "./types.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { quizResponseId } = await req.json();
    console.log("Generating feedback for quiz response:", quizResponseId);

    if (!quizResponseId) {
      throw new Error("Missing quiz response ID");
    }

    // Initialize Supabase client
    const supabase = createSupabaseClient();

    // Fetch quiz response data with details needed for feedback
    const { data: quizResponse, error: quizResponseError } = await supabase
      .from('quiz_responses')
      .select(`
        *,
        question_responses(
          question_id,
          student_answer,
          is_correct,
          topic
        ),
        quiz:quizzes(
          title,
          quiz_questions(
            id,
            question,
            correct_answer,
            options,
            topic,
            explanation,
            difficulty
          )
        )
      `)
      .eq('id', quizResponseId)
      .single();

    if (quizResponseError) {
      console.error("Error fetching quiz response:", quizResponseError);
      throw new Error(`Error fetching quiz response: ${quizResponseError.message}`);
    }

    if (!quizResponse) {
      throw new Error("Quiz response not found");
    }

    // Analyze the quiz response data
    const analysisData = analyzeQuizResponses(quizResponse as QuizResponse);
    
    // Generate AI feedback based on the analysis
    const aiFeedback = generateFeedback(analysisData, quizResponse.score);

    console.log("Generated AI feedback:", aiFeedback);

    // Update the quiz response with the AI feedback
    const { error: updateError } = await supabase
      .from('quiz_responses')
      .update({ ai_feedback: aiFeedback })
      .eq('id', quizResponseId);

    if (updateError) {
      console.error("Error updating quiz response with AI feedback:", updateError);
      throw new Error(`Error updating quiz response: ${updateError.message}`);
    }

    // Now update the student's profile with their strengths and areas for improvement
    try {
      // Get course id from the quiz
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('course_id')
        .eq('id', quizResponse.quiz_id)
        .single();

      if (quizData?.course_id) {
        await updateStudentProfile(
          supabase, 
          quizResponse.student_id, 
          quizData.course_id, 
          aiFeedback.strengths, 
          aiFeedback.areas_for_improvement
        );
      }
    } catch (error) {
      // Don't fail the whole operation if this part fails
      console.error("Error updating student profile with strengths:", error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "AI feedback generated successfully",
        feedback: aiFeedback
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Error in generate-quiz-feedback function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
