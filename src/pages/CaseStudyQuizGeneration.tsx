import { useState } from "react";
import { 
  Book, 
  ListChecks, 
  Newspaper, 
  Eye 
} from "lucide-react";
import { Question, QuestionDifficulty, Topic } from "@/types/quiz";
import { StepContainer } from "@/components/quiz-generation/StepContainer";
import { CourseSetupStep } from "@/components/case-study-quiz/steps/CourseSetupStep";
import { TopicsSetupStep } from "@/components/case-study-quiz/steps/TopicsSetupStep";
import { NewsSourcesStep } from "@/components/case-study-quiz/steps/NewsSourcesStep";
import { QuizPreviewStep } from "@/components/case-study-quiz/steps/QuizPreviewStep";
import { StepProgress } from "@/components/quiz-generation/StepProgress";
import { NavigationFooter } from "@/components/quiz-generation/NavigationFooter";
import { Badge } from "@/components/ui/badge";
import { useGenerateQuiz } from "@/hooks/case-study-quiz/useGenerateQuiz";
import { AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuizDisclaimer } from "@/components/quiz-generation/QuizDisclaimer";
import { GenerateQuizDialog } from "@/components/quiz-generation/GenerateQuizDialog";
import { QuizTitleInput } from "@/components/quiz-generation/QuizTitleInput";

const CaseStudyQuizGeneration = () => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState<Topic[]>([{ description: "", numQuestions: 3 }]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("high_school");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  
  const { 
    isGenerating, 
    quizQuestions, 
    newsSources, 
    quizId,
    error,
    generateQuiz 
  } = useGenerateQuiz();

  const handleNextStep = () => {
    if (step === 1 && !selectedCourseId) {
      toast({
        title: "Course required",
        description: "Please select a course before continuing",
        variant: "destructive",
      });
      return;
    }

    if (step === 1 && !title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a quiz title before continuing",
        variant: "destructive",
      });
      return;
    }

    if (step === 2 && !topics[0].description) {
      toast({
        title: "Topic required",
        description: "Please enter at least one topic before continuing",
        variant: "destructive",
      });
      return;
    }

    setStep(prev => Math.min(prev + 1, 4));
  };

  const handlePreviousStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const canProceedToNextStep = () => {
    if (step === 1) return !!selectedCourseId && !!title.trim();
    if (step === 2) return !!topics[0].description;
    return true;
  };

  const handleGenerateClick = () => {
    setShowGenerateDialog(true);
  };

  const handleGenerate = async () => {
    try {
      await generateQuiz(topics, selectedCourseId, difficulty);
    } catch (err) {
      console.error("Error in handleGenerate:", err);
    }
  };

  const steps = [
    { label: "Course", icon: Book },
    { label: "Topics", icon: ListChecks },
    { label: "Sources", icon: Newspaper },
    { label: "Preview", icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                Case Study Quiz Generator
              </h1>
              {newsSources.length > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  {newsSources.length} Sources Found
                </Badge>
              )}
            </div>
            
            <StepProgress 
              steps={steps}
              currentStep={step}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepContainer key="course">
                <div className="mb-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiz-title">Quiz Title</Label>
                    <Input
                      id="quiz-title"
                      placeholder="Enter a title for your quiz"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <CourseSetupStep
                    selectedCourseId={selectedCourseId}
                    setSelectedCourseId={setSelectedCourseId}
                    difficulty={difficulty}
                    setDifficulty={setDifficulty}
                  />
                </div>
              </StepContainer>
            )}

            {step === 2 && (
              <StepContainer key="topics">
                <TopicsSetupStep
                  topics={topics}
                  setTopics={setTopics}
                />
              </StepContainer>
            )}

            {step === 3 && (
              <StepContainer key="sources">
                <NewsSourcesStep
                  newsSources={newsSources}
                />
              </StepContainer>
            )}

            {step === 4 && (
              <StepContainer key="preview">
                <QuizPreviewStep
                  title={title}
                  setTitle={setTitle}
                  questions={quizQuestions}
                  isGenerating={isGenerating}
                  error={error}
                  onGenerate={handleGenerateClick}
                  quizId={quizId}
                />
              </StepContainer>
            )}
          </AnimatePresence>

          <NavigationFooter
            currentStep={step}
            totalSteps={4}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            isNextDisabled={!canProceedToNextStep()}
            isGenerating={isGenerating}
            onGenerate={step === 4 ? handleGenerateClick : undefined}
          />
          
          <div className="mt-8">
            <QuizDisclaimer />
          </div>
        </div>
      </main>
      
      <GenerateQuizDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onConfirm={handleGenerate}
      />
    </div>
  );
};

export default CaseStudyQuizGeneration;
