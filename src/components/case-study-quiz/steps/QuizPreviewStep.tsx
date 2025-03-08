
import { StepHeader } from "@/components/quiz-generation/StepHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Eye, Loader2, Wand2 } from "lucide-react";
import { Question } from "@/types/quiz";
import { EmptyState } from "@/components/quiz-generation/EmptyState";
import { Quiz } from "@/components/quiz-generation/QuizOutput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QuizPreviewStepProps {
  questions: Question[];
  isGenerating: boolean;
  error?: string | null;
  onGenerate: () => void;
}

export const QuizPreviewStep = ({
  questions,
  isGenerating,
  error,
  onGenerate,
}: QuizPreviewStepProps) => {
  // Ensure we always have a valid array of questions
  const validQuestions = Array.isArray(questions) ? questions : [];

  return (
    <div className="space-y-6">
      <StepHeader
        title="Quiz Preview"
        description="Review and generate your case study quiz"
        icon={Eye}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {validQuestions.length > 0 ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Quiz Preview</h3>
              <Quiz questions={validQuestions} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 sm:py-12">
            <EmptyState
              icon={Eye}
              title="No Questions Generated Yet"
              description="Click generate to create your case study quiz based on current news stories"
              action={
                <Button
                  onClick={onGenerate}
                  disabled={isGenerating}
                  size="lg"
                  className="mt-2 w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
