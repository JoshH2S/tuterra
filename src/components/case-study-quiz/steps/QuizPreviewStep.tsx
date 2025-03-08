
import { StepHeader } from "@/components/quiz-generation/StepHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Eye, Loader2, Wand2 } from "lucide-react";
import { Question } from "@/types/quiz";
import { EmptyState } from "@/components/quiz-generation/EmptyState";
import { Quiz } from "@/components/quiz-generation/QuizOutput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuizPublishing } from "@/hooks/quiz/useQuizPublishing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuizPreviewStepProps {
  title: string;
  setTitle: (title: string) => void;
  questions: Question[];
  isGenerating: boolean;
  error?: string | null;
  onGenerate: () => void;
}

export const QuizPreviewStep = ({
  title,
  setTitle,
  questions,
  isGenerating,
  error,
  onGenerate,
}: QuizPreviewStepProps) => {
  // Ensure we always have a valid array of questions
  const validQuestions = Array.isArray(questions) ? questions : [];
  
  // Use the quiz publishing hook to handle publishing
  const { handlePublish } = useQuizPublishing(30); // Default 30 minute duration

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
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="quiz-title-final">Quiz Title</Label>
                <Input
                  id="quiz-title-final"
                  placeholder="Enter a title for your quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Quiz Preview</h3>
              <Quiz questions={validQuestions} />
              
              {/* Add publish button after quiz is displayed */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button 
                  onClick={handlePublish}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  Publish Quiz
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Publishing will make this quiz available for students to take
                </p>
              </div>
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
