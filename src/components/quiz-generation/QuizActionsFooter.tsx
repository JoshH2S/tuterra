
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Question } from "@/types/quiz-generation";
import { toast } from "@/components/ui/use-toast";
import { useQuizPublishing } from "@/hooks/quiz/useQuizPublishing";
import { Loader2 } from "lucide-react";

interface QuizActionsFooterProps {
  quizId?: string;
  quizQuestions: Question[];
  title?: string;
  duration?: number;
}

export const QuizActionsFooter = ({
  quizId,
  quizQuestions,
  title = "Untitled Quiz",
  duration = 30
}: QuizActionsFooterProps) => {
  const { handlePublish, isPublishing } = useQuizPublishing();

  // Only display if we have quizQuestions and a quizId
  if (quizQuestions.length === 0) {
    return null;
  }

  const onPublish = () => {
    console.log("Publishing quiz with ID:", quizId);
    if (quizId) {
      handlePublish(quizId, duration, title);
    } else {
      console.error("No quiz ID available for publishing");
      toast({
        title: "Error",
        description: "No quiz ID available for publishing. Please try regenerating the quiz.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
      <Card className="bg-gray-50 dark:bg-gray-800/50 p-6">
        <div className="flex flex-col items-center justify-center">
          <Button 
            onClick={onPublish}
            size="lg"
            className="w-full md:w-auto"
            disabled={isPublishing || !quizId}
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Quiz'
            )}
          </Button>
          {!quizId && quizQuestions.length > 0 && (
            <p className="text-red-500 text-sm mt-2">
              Quiz ID is missing. Please try regenerating the quiz.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
