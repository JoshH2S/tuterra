
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Question } from "@/types/quiz-generation";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuizPublishing } from "@/hooks/quiz/useQuizPublishing";
import { Loader2 } from "lucide-react";

interface QuizActionsFooterProps {
  quizId?: string; // Make quizId optional for backward compatibility
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

  if (quizQuestions.length === 0 || !quizId) {
    return null;
  }

  const onPublish = () => {
    handlePublish(quizId, duration, title);
  };

  return (
    <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
      <Card className="bg-gray-50 dark:bg-gray-800/50 p-6">
        <div className="flex flex-col items-center justify-center">
          <Button 
            onClick={onPublish}
            size="lg"
            className="w-full md:w-auto"
            disabled={isPublishing}
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
        </div>
      </Card>
    </div>
  );
};
