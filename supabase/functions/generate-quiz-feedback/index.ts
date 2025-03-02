
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

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
    // Get the request body
    const { quizResponseId } = await req.json();
    console.log("Generating feedback for quiz response:", quizResponseId);

    if (!quizResponseId) {
      throw new Error("Missing quiz response ID");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
            explanation
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

    // Group question responses by topic to analyze performance by topic
    const topicResponses = {};
    quizResponse.question_responses.forEach(qr => {
      if (!qr.topic) return;
      
      if (!topicResponses[qr.topic]) {
        topicResponses[qr.topic] = {
          total: 0,
          correct: 0
        };
      }
      
      topicResponses[qr.topic].total++;
      if (qr.is_correct) {
        topicResponses[qr.topic].correct++;
      }
    });

    // Identify strengths and areas for improvement
    const strengths = [];
    const areasForImprovement = [];

    Object.entries(topicResponses).forEach(([topic, data]) => {
      const percentage = (data.correct / data.total) * 100;
      
      if (percentage >= 70) {
        strengths.push(`You demonstrated good understanding of ${topic} concepts (${Math.round(percentage)}% correct).`);
      } else {
        areasForImprovement.push(`You might need more practice with ${topic} concepts (${Math.round(percentage)}% correct).`);
      }
    });

    // If no specific topics are identified, provide general feedback
    if (strengths.length === 0) {
      if (quizResponse.score >= 70) {
        strengths.push("You demonstrated good overall knowledge of the subject matter.");
      } else if (quizResponse.score >= 50) {
        strengths.push("You have a basic understanding of the key concepts covered in this quiz.");
      } else {
        strengths.push("You attempted all questions, which shows commitment to learning the material.");
      }
    }

    if (areasForImprovement.length === 0) {
      if (quizResponse.score < 70) {
        areasForImprovement.push("You may benefit from a general review of the core concepts covered in this quiz.");
      } else if (quizResponse.score < 90) {
        areasForImprovement.push("Although you did well overall, reviewing specific questions you missed could improve your understanding.");
      }
    }

    // Generate advice based on performance
    let advice = "";
    if (quizResponse.score >= 90) {
      advice = "Excellent work! To further enhance your knowledge, consider exploring advanced topics or helping peers understand these concepts.";
    } else if (quizResponse.score >= 70) {
      advice = "Good job! Review the questions you missed and focus on understanding why the correct answers are correct. Consider creating flashcards for concepts you find challenging.";
    } else if (quizResponse.score >= 50) {
      advice = "You're on the right track! Try creating a study schedule focusing on the topics where you scored lower. Consider seeking additional resources or asking for help with specific concepts.";
    } else {
      advice = "Don't get discouraged! Learning takes time. Consider revisiting the foundational concepts, breaking them down into smaller pieces, and practicing regularly. Reach out to your instructor for additional support.";
    }

    // Compile the AI feedback
    const aiFeedback = {
      strengths,
      areas_for_improvement: areasForImprovement,
      advice
    };

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
