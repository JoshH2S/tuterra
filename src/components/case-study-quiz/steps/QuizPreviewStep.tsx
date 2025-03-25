
import { useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import { MouseEventHandler } from "react";
import { QuizDisclaimer } from "@/components/quiz-generation/QuizDisclaimer";
import { GenerateQuizDialog } from "@/components/quiz-generation/GenerateQuizDialog";
import { Checkbox } from "@/components/ui/checkbox";

interface QuizPreviewStepProps {
  title: string;
  setTitle: (title: string) => void;
  questions: Question[];
  isGenerating: boolean;
  error?: string | null;
  onGenerate: () => void;
  quizId?: string;
}

export const QuizPreviewStep = ({
  title,
  setTitle,
  questions,
  isGenerating,
  error,
  onGenerate,
  quizId,
}: QuizPreviewStepProps) => {
  // Ensure we always have a valid array of questions
  const validQuestions = Array.isArray(questions) ? questions : [];
  
  // State for showing answers
  const [showAnswers, setShowAnswers] = useState(false);
  
  // Use the quiz publishing hook
  const { handlePublish, isPublishing } = useQuizPublishing();

  // Add state for the generate dialog
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  // Create a wrapper function for the publish button
  const onPublish: MouseEventHandler<HTMLButtonElement> = () => {
    console.log("Publishing with quiz ID:", quizId);
    if (quizId) {
      handlePublish(quizId, 30, title);
    } else {
      toast({
        title: "Error",
        description: "No quiz ID available for publishing. Please try regenerating the quiz.",
        variant: "destructive",
      });
    }
  };

  // Add a handler for the generate button that shows dialog first
  const handleGenerateClick = () => {
    setShowGenerateDialog(true);
  };

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
              
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="show-answers" 
                  checked={showAnswers}
                  onCheckedChange={(checked) => setShowAnswers(!!checked)}
                />
                <Label 
                  htmlFor="show-answers" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Show correct answers and explanations
                </Label>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Quiz Preview</h3>
              <Quiz questions={validQuestions} showAnswers={showAnswers} />
              
              {/* Add publish button after quiz is displayed */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-center">
                <Button 
                  onClick={onPublish}
                  className="w-full sm:w-auto"
                  size="lg"
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
                {!quizId && (
                  <p className="text-red-500 text-sm mt-2 sm:mt-0">
                    Quiz ID is missing. Please try regenerating the quiz.
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2 sm:mt-0 sm:ml-auto">
                  Publishing will make this quiz available for students to take
                </p>
              </div>
              
              {/* Add disclaimer footer */}
              <QuizDisclaimer />
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
                  onClick={handleGenerateClick}
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
            <QuizDisclaimer />
          </CardContent>
        </Card>
      )}

      {/* Generate Quiz Confirmation Dialog */}
      <GenerateQuizDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onConfirm={onGenerate}
      />
    </div>
  );
};
