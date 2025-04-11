
import { useState } from "react";
import { StepHeader } from "@/components/quiz-generation/StepHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Eye, Loader2, Newspaper, Wand2 } from "lucide-react";
import { Question, isCaseStudyQuestion, isRegularQuestion } from "@/types/quiz";
import { EmptyState } from "@/components/quiz-generation/EmptyState";
import { Quiz } from "@/components/quiz-generation/QuizOutput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuizPublishing } from "@/hooks/quiz/useQuizPublishing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MouseEventHandler } from "react";
import { QuizDisclaimer } from "@/components/quiz-generation/QuizDisclaimer";
import { Checkbox } from "@/components/ui/checkbox";
import { NewsSources } from "@/components/case-study-quiz/NewsSources";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuizPreviewStepProps {
  title: string;
  setTitle: (title: string) => void;
  questions: Question[];
  isGenerating: boolean;
  error?: string | null;
  onGenerate: () => void;
  quizId?: string;
  newsSources: Array<{ title: string; source: string; url: string; }>;
}

export const QuizPreviewStep = ({
  title,
  setTitle,
  questions,
  isGenerating,
  error,
  onGenerate,
  quizId,
  newsSources,
}: QuizPreviewStepProps) => {
  // Ensure we always have a valid array of questions
  const validQuestions = Array.isArray(questions) ? questions : [];
  
  // State for showing answers and controlling question display
  const [showAnswers, setShowAnswers] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  
  // Use the quiz publishing hook
  const { handlePublish, isPublishing } = useQuizPublishing();

  // Determine which questions to display
  const displayQuestions = showAllQuestions ? validQuestions : validQuestions.slice(0, 5);
  const hiddenQuestionsCount = validQuestions.length - 5;

  // Count question types for summary
  const caseStudyCount = validQuestions.filter(isCaseStudyQuestion).length;
  const regularCount = validQuestions.filter(isRegularQuestion).length;

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

  return (
    <div className="space-y-6">
      <StepHeader
        title="Quiz Preview & Sources"
        description="Review your generated quiz and its sources"
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
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>Quiz Preview</span>
              </TabsTrigger>
              <TabsTrigger value="sources" className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                <span>News Sources {newsSources.length > 0 && `(${newsSources.length})`}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
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
                  
                  {/* Quiz summary section */}
                  {validQuestions.length > 0 && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <h4 className="font-medium mb-2">Quiz Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total Questions:</span>
                          <span className="font-medium">{validQuestions.length}</span>
                        </div>
                        
                        {/* Show question type breakdown if both types exist */}
                        {caseStudyCount > 0 && regularCount > 0 && (
                          <>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                              <span>Case Study Questions:</span>
                              <span>{caseStudyCount}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                              <span>Regular Questions:</span>
                              <span>{regularCount}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
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
                  
                  {/* Show limited questions with option to see more */}
                  <div className="space-y-4">
                    <Quiz questions={displayQuestions} showAnswers={showAnswers} />
                    
                    {validQuestions.length > 5 && (
                      <div className="flex flex-col items-center mt-4">
                        <p className="text-center text-gray-500 mb-2">
                          {showAllQuestions ? 'Showing all questions' : `+ ${hiddenQuestionsCount} more question${hiddenQuestionsCount !== 1 ? 's' : ''}`}
                        </p>
                        <Button 
                          onClick={() => setShowAllQuestions(!showAllQuestions)} 
                          variant="outline"
                          size="sm"
                          className="touch-manipulation"
                        >
                          {showAllQuestions ? 'Show Less' : 'Show All Questions'}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Add publish button after quiz is displayed */}
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-center">
                    <Button 
                      onClick={onPublish}
                      className="w-full sm:w-auto touch-manipulation"
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
            </TabsContent>
            
            <TabsContent value="sources" className="focus-visible:outline-none focus-visible:ring-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Newspaper className="h-5 w-5" />
                    News Sources Used in Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {newsSources.length > 0 ? (
                    <div className="space-y-4">
                      {newsSources.map((source, index) => (
                        <div 
                          key={index} 
                          className="p-4 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium mb-1">{source.title}</h3>
                              <p className="text-sm text-muted-foreground">{source.source}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild
                              className="ml-2 touch-manipulation"
                            >
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                View Source
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <Newspaper className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Sources Available</h3>
                      <p className="text-muted-foreground">No news sources were found for this quiz.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Add publish button on sources tab too */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
                <Button 
                  onClick={onPublish}
                  className="w-full sm:w-auto touch-manipulation"
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
              </div>
            </TabsContent>
          </Tabs>
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
                  className="mt-2 w-full sm:w-auto touch-manipulation"
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
    </div>
  );
};
