
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuizTimer } from "@/hooks/quiz/useQuizTimer";
import { QuestionDifficulty } from "@/types/quiz";

interface QuizQuestion {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  topic: string;
  points: number;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  quiz_questions: QuizQuestion[];
}

const TakeQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const handleTimeEnd = () => {
    toast({
      title: "Time's up!",
      description: "Your quiz time has ended. Submitting your answers now.",
      variant: "destructive",
    });
    handleSubmit();
  };

  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions (
            id,
            question,
            options,
            correct_answer,
            topic,
            points,
            difficulty
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Quiz;
    },
  });

  // Initialize timer once quiz data is loaded
  const remainingTime = useQuizTimer(
    quiz?.duration_minutes || 0, 
    handleTimeEnd
  );

  if (isLoadingQuiz) {
    return <div>Loading quiz...</div>;
  }

  if (!quiz || !quiz.quiz_questions) {
    return <div>Quiz not found or no questions available.</div>;
  }

  const questions = quiz.quiz_questions;

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answer });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    try {
      const correctAnswersCount = questions.reduce((count, question, index) => {
        const selectedAnswer = selectedAnswers[index];
        return selectedAnswer === question.correct_answer ? count + 1 : count;
      }, 0);

      // Calculate score as a percentage (0-100) instead of a decimal
      const scorePercentage = Math.round((correctAnswersCount / questions.length) * 100);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        throw new Error("Not authenticated");
      }

      // Prepare topic performance data
      const topicPerformance: Record<string, { correct: number; total: number }> = {};
      questions.forEach((question, index) => {
        const topic = question.topic;
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { correct: 0, total: 0 };
        }
        topicPerformance[topic].total++;
        if (selectedAnswers[index] === question.correct_answer) {
          topicPerformance[topic].correct++;
        }
      });

      const { data, error } = await supabase
        .from('quiz_responses')
        .insert([
          {
            quiz_id: id,
            student_id: sessionData.session.user.id,
            score: scorePercentage, // Use integer percentage (0-100) instead of decimal
            correct_answers: correctAnswersCount,
            total_questions: questions.length,
            topic_performance: topicPerformance,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Quiz submitted successfully!",
      });
      
      // Ensure we navigate to the quiz results page with the new response ID
      console.log("Navigating to quiz results:", `/quiz-results/${data.id}`);
      navigate(`/quiz-results/${data.id}`);
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updated difficulty mapping function
  const mapDifficultyToDisplay = (dbDifficulty: string): QuestionDifficulty => {
    switch (dbDifficulty) {
      case "beginner":
        return "middle_school";
      case "intermediate":
        return "high_school";
      case "advanced":
        return "university";
      case "expert":
        return "post_graduate";
      default:
        return "high_school";
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Take Quiz</CardTitle>
          <CardDescription>
            {quiz.title} - {remainingTime ? `Time remaining: ${remainingTime}` : "No time limit"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4">
            <p className="text-lg font-semibold">
              Question {currentQuestion + 1} / {questions.length}
            </p>
            <p className="text-gray-600">{questions[currentQuestion].question}</p>
          </div>
          <RadioGroup
            value={selectedAnswers[currentQuestion]}
            onValueChange={(value) => handleAnswerSelect(currentQuestion, value)}
          >
            {Object.entries(questions[currentQuestion].options).map(
              ([key, value]) => (
                <div key={key} className="flex items-center space-x-2 mb-2 p-2 hover:bg-gray-50 rounded-md">
                  <RadioGroupItem value={key} id={key} className="border-2" />
                  <Label htmlFor={key} className="flex-1 cursor-pointer">{value}</Label>
                </div>
              )
            )}
          </RadioGroup>
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="min-w-[100px]"
            >
              Previous
            </Button>
            {currentQuestion < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="min-w-[100px]"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="min-w-[100px] bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
          {currentQuestion === questions.length - 1 && (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="w-full mt-6 py-6 text-lg bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TakeQuiz;
