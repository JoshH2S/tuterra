
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Question } from "@/types/quiz-generation";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuizPublishing } from "@/hooks/quiz/useQuizPublishing";

interface QuizActionsFooterProps {
  quizQuestions: Question[];
  title?: string; // Make title optional
  duration?: number; // Make duration optional
}

export const QuizActionsFooter = ({
  quizQuestions,
  title = "Untitled Quiz", // Default title
  duration = 30 // Default duration
}: QuizActionsFooterProps) => {
  const { handlePublish } = useQuizPublishing(duration, title);

  if (quizQuestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
      <Card className="bg-gray-50 dark:bg-gray-800/50 p-6">
        <div className="flex flex-col items-center justify-center">
          <Button 
            onClick={handlePublish}
            size="lg"
            className="w-full md:w-auto"
          >
            Publish Quiz
          </Button>
        </div>
      </Card>
    </div>
  );
};
