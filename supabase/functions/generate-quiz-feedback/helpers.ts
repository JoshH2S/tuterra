
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";
import { 
  QuizResponse, 
  AnalysisData, 
  AIFeedback, 
  TopicPerformance 
} from "./types.ts";

// Create a Supabase client
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Analyze quiz responses and extract performance data
export function analyzeQuizResponses(quizResponse: QuizResponse): AnalysisData {
  const topicResponses: Record<string, { total: number, correct: number }> = {};
  const difficultyResponses: Record<string, { total: number, correct: number }> = {};
  const commonMistakes: { topic: string, difficulty: string }[] = [];
  
  // Track correct and incorrect answers for pattern analysis
  const correctAnswers: { question: string, topic: string, difficulty: string }[] = [];
  const incorrectAnswers: { 
    question: string, 
    studentAnswer: string, 
    correctAnswer: string, 
    topic: string, 
    difficulty: string,
    explanation?: string 
  }[] = [];
  
  quizResponse.question_responses.forEach(qr => {
    // Track by topic
    if (qr.topic) {
      if (!topicResponses[qr.topic]) {
        topicResponses[qr.topic] = { total: 0, correct: 0 };
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
          difficultyResponses[difficulty] = { total: 0, correct: 0 };
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

  return {
    topicResponses,
    difficultyResponses,
    commonMistakes,
    correctAnswers,
    incorrectAnswers
  };
}

// Update student profile with strengths and areas for improvement
export async function updateStudentProfile(
  supabase: any, 
  studentId: string, 
  courseId: string, 
  strengths: string[], 
  areasForImprovement: string[]
) {
  try {
    // Get current student performance record
    const { data: performance } = await supabase
      .from('student_performance')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();
      
    if (performance) {
      // Update the student performance with strengths and areas for improvement
      const existingStrengths = performance.strengths || [];
      const existingAreas = performance.areas_for_improvement || [];
      
      // Add new unique strengths and areas for improvement
      const updatedStrengths = [...new Set([...existingStrengths, ...strengths])];
      const updatedAreas = [...new Set([...existingAreas, ...areasForImprovement])];
      
      // Update student performance
      await supabase
        .from('student_performance')
        .update({
          strengths: updatedStrengths,
          areas_for_improvement: updatedAreas,
          last_activity: new Date().toISOString()
        })
        .eq('id', performance.id);
    }
  } catch (error) {
    // Don't fail the whole operation if this part fails
    console.error("Error updating student profile with strengths:", error);
  }
}
