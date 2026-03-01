import { useState } from "react";
import { CheckCircle, Lightbulb, Send, BookOpen, HelpCircle, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import { ModuleStep, SubmissionData, QuizQuestion } from "@/types/course-engine";
import { cn } from "@/lib/utils";
import { SlideNavigator } from "./SlideNavigator";

interface StepRendererProps {
  step: ModuleStep;
  onSubmit: (submission: SubmissionData) => Promise<void>;
  isSubmitting: boolean;
  onTeachComplete?: () => void; // Called when user completes viewing all slides
}

export function StepRenderer({ step, onSubmit, isSubmitting, onTeachComplete }: StepRendererProps) {
  const [response, setResponse] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);

  const handleTextSubmit = async () => {
    if (!response.trim()) return;
    await onSubmit({ text: response, response });
    setResponse("");
  };

  const handleQuizSubmit = async () => {
    await onSubmit({ answers: quizAnswers });
  };

  const getStepIcon = () => {
    switch (step.step_type) {
      case 'teach': return <BookOpen className="h-5 w-5" />;
      case 'prompt': return <HelpCircle className="h-5 w-5" />;
      case 'quiz': return <CheckCircle className="h-5 w-5" />;
      case 'checkpoint': return <CheckCircle className="h-5 w-5" />;
      case 'reflection': return <PenTool className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getStepLabel = () => {
    switch (step.step_type) {
      case 'teach': return 'Learn';
      case 'prompt': return 'Practice';
      case 'quiz': return 'Quiz';
      case 'checkpoint': return 'Checkpoint';
      case 'reflection': return 'Reflect';
      default: return 'Step';
    }
  };

  // Render teaching content
  if (step.step_type === 'teach') {
    // Use slide-based navigation if slides are available
    if (step.content.slides && step.content.slides.length > 0) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              {getStepIcon()}
              {getStepLabel()}
            </Badge>
            {step.title && <h2 className="text-xl font-semibold">{step.title}</h2>}
          </div>

          <SlideNavigator 
            slides={step.content.slides} 
            onComplete={onTeachComplete}
            autoMarkComplete={true}
            isSubmitting={isSubmitting}
          />
        </div>
      );
    }

    // Fallback to legacy single-page format for backward compatibility
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            {getStepIcon()}
            {getStepLabel()}
          </Badge>
          {step.title && <h2 className="text-xl font-semibold">{step.title}</h2>}
        </div>

        {step.content.text && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {step.content.text}
            </p>
          </div>
        )}

        {step.content.keyPoints && step.content.keyPoints.length > 0 && (
          <PremiumCard className="p-4 bg-primary/5 border-primary/20">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-primary" />
              Key Points
            </h3>
            <ul className="space-y-2">
              {step.content.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </PremiumCard>
        )}
      </div>
    );
  }

  // Shared floating card styling (matches SlideNavigator)
  const contentCardClass = "relative rounded-xl bg-white p-6 space-y-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_8px_24px_-4px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.8)]";

  // Render prompt/reflection
  if (step.step_type === 'prompt' || step.step_type === 'reflection') {
    const prompts = step.step_type === 'reflection' 
      ? step.content.reflectionPrompts 
      : [step.content.question];

    return (
      <div className={contentCardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            {getStepIcon()}
            {getStepLabel()}
          </Badge>
          {step.title && <h2 className="text-xl font-semibold">{step.title}</h2>}
        </div>

        {prompts?.map((prompt, index) => (
          <div key={index} className="space-y-4">
            <p className="text-base font-medium">{prompt}</p>
          </div>
        ))}

        {step.content.hints && step.content.hints.length > 0 && (
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHint(!showHint)}
              className="text-muted-foreground"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {showHint && (
              <p className="mt-2 text-sm text-muted-foreground italic pl-6">
                {step.content.hints[0]}
              </p>
            )}
          </div>
        )}

        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response here..."
          className="min-h-[150px]"
        />

        <Button 
          onClick={handleTextSubmit} 
          disabled={!response.trim() || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>Submitting...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Response
            </>
          )}
        </Button>
      </div>
    );
  }

  // Render quiz/checkpoint
  if (step.step_type === 'quiz' || step.step_type === 'checkpoint') {
    const questions = step.content.questions || [];
    const allAnswered = questions.every(q => quizAnswers[q.id]);

    return (
      <div className={contentCardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            {getStepIcon()}
            {getStepLabel()}
          </Badge>
          {step.title && <h2 className="text-xl font-semibold">{step.title}</h2>}
        </div>

        {step.content.instructions && (
          <p className="text-muted-foreground">{step.content.instructions}</p>
        )}

        <div className="space-y-8">
          {questions.map((question, qIndex) => (
            <PremiumCard key={question.id} className="p-4">
              <p className="font-medium mb-4">
                {qIndex + 1}. {question.question}
              </p>
              <RadioGroup
                value={quizAnswers[question.id] || ''}
                onValueChange={(value) => setQuizAnswers(prev => ({
                  ...prev,
                  [question.id]: value
                }))}
                className="space-y-3"
              >
                {(['A', 'B', 'C', 'D'] as const).map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={option} 
                      id={`${question.id}-${option}`}
                      className="flex-shrink-0"
                    />
                    <Label 
                      htmlFor={`${question.id}-${option}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      <span className="font-medium mr-2">{option}.</span>
                      {question.options[option]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </PremiumCard>
          ))}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleQuizSubmit} 
            disabled={!allAnswered || isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Answers
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
