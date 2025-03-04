
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

    // Group question responses by topic to analyze performance by topic
    const topicResponses = {};
    const difficultyResponses = {};
    const commonMistakes = [];
    
    // Track correct and incorrect answers for pattern analysis
    const correctAnswers = [];
    const incorrectAnswers = [];
    
    quizResponse.question_responses.forEach(qr => {
      // Track by topic
      if (qr.topic) {
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
      }
      
      // Find the corresponding question details
      const questionDetails = quizResponse.quiz.quiz_questions.find(qq => qq.id === qr.question_id);
      
      if (questionDetails) {
        // Track by difficulty
        if (questionDetails.difficulty) {
          const difficulty = questionDetails.difficulty;
          
          if (!difficultyResponses[difficulty]) {
            difficultyResponses[difficulty] = {
              total: 0,
              correct: 0
            };
          }
          
          difficultyResponses[difficulty].total++;
          if (qr.is_correct) {
            difficultyResponses[difficulty].correct++;
          }
        }
        
        // Add to correct/incorrect answer lists
        if (qr.is_correct) {
          correctAnswers.push({
            question: questionDetails.question,
            topic: qr.topic,
            difficulty: questionDetails.difficulty
          });
        } else {
          incorrectAnswers.push({
            question: questionDetails.question,
            studentAnswer: qr.student_answer,
            correctAnswer: questionDetails.correct_answer,
            topic: qr.topic,
            difficulty: questionDetails.difficulty,
            explanation: questionDetails.explanation
          });
          
          // Store for patterns in common mistakes
          commonMistakes.push({
            topic: qr.topic,
            difficulty: questionDetails.difficulty
          });
        }
      }
    });

    // Identify strengths based on topics and difficulty levels
    const strengths = [];
    
    // Topic-based strengths
    Object.entries(topicResponses).forEach(([topic, data]) => {
      const percentage = (data.correct / data.total) * 100;
      
      if (percentage >= 70) {
        const performanceLevel = percentage >= 90 ? "excellent" : (percentage >= 80 ? "strong" : "good");
        strengths.push(`You demonstrated ${performanceLevel} understanding of ${topic} concepts (${Math.round(percentage)}% correct).`);
      }
    });
    
    // Difficulty-based strengths
    Object.entries(difficultyResponses).forEach(([difficulty, data]) => {
      const percentage = (data.correct / data.total) * 100;
      
      if (percentage >= 70 && data.total >= 2) { // Only include if there are enough questions
        strengths.push(`You performed well on ${difficulty}-level questions (${Math.round(percentage)}% correct).`);
      }
    });
    
    // Pattern-based strengths (consistent correct answering)
    if (correctAnswers.length >= 3) {
      const correctTopics = correctAnswers.map(a => a.topic).filter(Boolean);
      
      // Find topics that appear multiple times in correct answers
      const topicCounts = {};
      correctTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
      
      Object.entries(topicCounts).forEach(([topic, count]) => {
        if (count >= 2 && !strengths.some(s => s.includes(topic))) {
          strengths.push(`You consistently answered ${topic} questions correctly.`);
        }
      });
    }

    // Identify areas for improvement
    const areasForImprovement = [];
    
    // Topic-based improvements
    Object.entries(topicResponses).forEach(([topic, data]) => {
      const percentage = (data.correct / data.total) * 100;
      
      if (percentage < 70) {
        const needLevel = percentage < 50 ? "significant improvement" : "more practice";
        areasForImprovement.push(`You need ${needLevel} with ${topic} concepts (${Math.round(percentage)}% correct).`);
      }
    });
    
    // Difficulty-based improvements
    Object.entries(difficultyResponses).forEach(([difficulty, data]) => {
      const percentage = (data.correct / data.total) * 100;
      
      if (percentage < 70 && data.total >= 2) { // Only include if there are enough questions
        areasForImprovement.push(`You struggled with ${difficulty}-level questions (${Math.round(percentage)}% correct).`);
      }
    });
    
    // Find common topics in incorrect answers
    if (incorrectAnswers.length > 0) {
      const incorrectTopics = incorrectAnswers.map(a => a.topic).filter(Boolean);
      
      // Find topics that appear multiple times in incorrect answers
      const topicCounts = {};
      incorrectTopics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
      
      Object.entries(topicCounts).forEach(([topic, count]) => {
        if (count >= 2 && !areasForImprovement.some(a => a.includes(topic))) {
          areasForImprovement.push(`Multiple errors were made on questions related to ${topic}.`);
        }
      });
    }

    // If no specific topics or difficulties are identified for strengths
    if (strengths.length === 0) {
      if (quizResponse.score >= 70) {
        strengths.push("You demonstrated good overall knowledge of the subject matter.");
      } else if (quizResponse.score >= 50) {
        strengths.push("You have a basic understanding of the key concepts covered in this quiz.");
      } else {
        strengths.push("You attempted all questions, which shows commitment to learning the material.");
      }
    }

    // If no specific topics or difficulties are identified for improvement
    if (areasForImprovement.length === 0) {
      if (quizResponse.score < 70) {
        areasForImprovement.push("You may benefit from a general review of the core concepts covered in this quiz.");
      } else if (quizResponse.score < 90) {
        areasForImprovement.push("Although you did well overall, reviewing specific questions you missed could improve your understanding.");
      }
    }

    // Generate advice based on performance and patterns
    let advice = "";
    
    if (quizResponse.score >= 90) {
      advice = "Excellent work! To further enhance your knowledge, consider exploring advanced topics or helping peers understand these concepts. Review any questions you missed to ensure complete mastery of the subject.";
    } else if (quizResponse.score >= 70) {
      advice = "Good job! Review the questions you missed and focus on understanding why the correct answers are correct. Create flashcards for concepts you find challenging, and consider setting up regular study sessions to reinforce your knowledge.";
    } else if (quizResponse.score >= 50) {
      advice = "You're on the right track! Try creating a study schedule focusing on the topics where you scored lower. Break down difficult concepts into smaller parts, use visual aids like diagrams or charts, and practice with additional questions. Consider seeking additional resources or asking for help with specific concepts.";
    } else {
      advice = "Don't get discouraged! Learning takes time. Revisit the foundational concepts, breaking them down into smaller pieces, and practice regularly. Establish a consistent study routine, use different learning modalities (visual, auditory, kinesthetic), and reach out to your instructor for additional support and resources.";
    }
    
    // Add specific advice based on difficulty patterns
    const difficultyLevels = ["beginner", "intermediate", "advanced", "expert"];
    let highestSuccessLevel = "";
    
    for (const level of difficultyLevels) {
      if (difficultyResponses[level] && (difficultyResponses[level].correct / difficultyResponses[level].total) >= 0.7) {
        highestSuccessLevel = level;
      }
    }
    
    if (highestSuccessLevel) {
      const nextLevel = difficultyLevels[difficultyLevels.indexOf(highestSuccessLevel) + 1];
      if (nextLevel) {
        advice += ` You're performing well at the ${highestSuccessLevel} level, so consider challenging yourself with more ${nextLevel}-level questions to continue growing.`;
      }
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
