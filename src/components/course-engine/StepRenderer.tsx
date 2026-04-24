import { useState, useEffect } from "react";
import { Lightbulb, Send, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ModuleStep, SubmissionData, StepSubmission } from "@/types/course-engine";
import { cn } from "@/lib/utils";
import { SlideNavigator } from "./SlideNavigator";

interface StepRendererProps {
  step: ModuleStep;
  onSubmit: (submission: SubmissionData) => Promise<void>;
  isSubmitting: boolean;
  onTeachComplete?: () => void;
  previousSubmission?: StepSubmission | null;
}

export function StepRenderer({ step, onSubmit, isSubmitting, onTeachComplete, previousSubmission }: StepRendererProps) {
  const [response, setResponse] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState(false);

  // Reset form when navigating to a new step
  useEffect(() => {
    setResponse("");
    setQuizAnswers({});
    setShowHint(false);
  }, [step.id]);

  // Pre-populate form from a previous submission (revisit or retry).
  // Guard: only apply if the submission actually belongs to this step —
  // prevents stale data from a prior step bleeding in while the DB fetch is in-flight.
  useEffect(() => {
    if (!previousSubmission?.submission) return;
    if (previousSubmission.step_id !== step.id) return;
    const sub = previousSubmission.submission;
    if (sub.text || sub.response) {
      setResponse(sub.text || sub.response || "");
    }
    if (sub.answers) {
      setQuizAnswers(sub.answers as Record<string, string>);
    }
  }, [previousSubmission, step.id]);

  const handleTextSubmit = async () => {
    if (!response.trim()) return;
    await onSubmit({ text: response, response });
    // Keep the response text so the form is pre-populated if the user retries
  };

  const handleQuizSubmit = async () => {
    await onSubmit({ answers: quizAnswers });
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

  const renderPreviousScoreBanner = () => {
    if (!previousSubmission || previousSubmission.is_passing) return null;
    const score = previousSubmission.score ?? previousSubmission.ai_feedback?.overallScore;
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
        <div>
          <span className="font-medium">Previous attempt: {score != null ? `${score}%` : 'not passed'}</span>
          <span className="text-amber-700"> — update your response below to try again.</span>
        </div>
      </div>
    );
  };

  const renderSubmittingOverlay = () => {
    if (!isSubmitting) return null;
    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/80 backdrop-blur-[2px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Evaluating your response…</p>
      </div>
    );
  };

  // Shared editorial card styling
  const contentCardClass = cn(
    "relative overflow-hidden rounded-2xl border border-primary-300/40",
    "bg-gradient-to-b from-white to-brand-light/30 p-7 sm:p-9",
    "shadow-[0_8px_32px_-12px_rgba(184,134,11,0.18),0_2px_8px_-2px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
  );

  // Shared editorial eyebrow row for any step
  const renderEyebrow = () => (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-600">
        {getStepLabel()}
      </span>
      <span className="h-px w-6 bg-primary-300/60" />
      {step.title && (
        <span className="font-bitter text-[15px] sm:text-base text-primary-900">
          {step.title}
        </span>
      )}
    </div>
  );

  // Render teaching content
  if (step.step_type === 'teach') {
    // Use slide-based navigation if slides are available
    if (step.content.slides && step.content.slides.length > 0) {
      return (
        <div>
          {renderEyebrow()}
          <SlideNavigator
            slides={step.content.slides}
            onComplete={onTeachComplete}
            autoMarkComplete={true}
            isSubmitting={isSubmitting}
          />
        </div>
      );
    }

    // Fallback to legacy single-page format
    return (
      <div className={contentCardClass}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
        {renderEyebrow()}

        {step.content.text && (
          <p className="font-bitter text-lg leading-relaxed text-neutral-text whitespace-pre-wrap">
            {step.content.text}
          </p>
        )}

        {step.content.keyPoints && step.content.keyPoints.length > 0 && (
          <div className="mt-7 border-t border-primary-300/30 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-3.5 w-3.5 text-primary-500" />
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-700">
                Key Takeaways
              </h3>
            </div>
            <ul className="space-y-3">
              {step.content.keyPoints.map((point, index) => (
                <li key={index} className="flex gap-3 text-sm leading-relaxed text-neutral-text">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Render prompt/reflection
  if (step.step_type === 'prompt' || step.step_type === 'reflection') {
    const prompts = step.step_type === 'reflection' 
      ? step.content.reflectionPrompts 
      : [step.content.question];

    return (
      <div className={contentCardClass}>
        {renderSubmittingOverlay()}

        {/* Top hairline accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />

        {renderEyebrow()}

        {/* Editorial question / prompt */}
        <div className="space-y-4">
          {prompts?.map((prompt, index) => (
            <p
              key={index}
              className="font-bitter text-xl sm:text-2xl leading-snug text-primary-900"
            >
              {prompt}
            </p>
          ))}
        </div>

        {renderPreviousScoreBanner() && <div className="mt-5">{renderPreviousScoreBanner()}</div>}

        {step.content.hints && step.content.hints.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowHint(!showHint)}
              className="group inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-primary-600 hover:text-primary-800 transition-colors"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            {showHint && (
              <p className="mt-3 border-l-2 border-primary-300/60 pl-4 text-sm italic leading-relaxed text-neutral-text">
                {step.content.hints[0]}
              </p>
            )}
          </div>
        )}

        {/* Refined response field */}
        <div className="mt-7">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-muted mb-2">
            Your response
          </label>
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Begin writing here…"
            className={cn(
              "min-h-[180px] rounded-xl border-primary-300/50 bg-white/80",
              "text-[15px] leading-relaxed text-neutral-text placeholder:text-neutral-muted/60",
              "shadow-[inset_0_1px_2px_0_rgba(184,134,11,0.06)]",
              "focus-visible:ring-2 focus-visible:ring-primary-400/40 focus-visible:ring-offset-0",
              "focus-visible:border-primary-500/70"
            )}
          />
        </div>

        {/* Action row */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="text-[11px] text-neutral-muted/70">
            {response.trim() ? `${response.trim().split(/\s+/).length} words` : 'Take your time.'}
          </span>
          <Button
            onClick={handleTextSubmit}
            disabled={!response.trim() || isSubmitting}
            size="lg"
            className={cn(
              "min-w-[180px] bg-gradient-to-br from-primary-400 to-primary-600 text-white",
              "shadow-[0_6px_20px_-6px_rgba(184,134,11,0.5)]",
              "hover:from-primary-500 hover:to-primary-700 hover:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)]",
              "disabled:from-primary-300 disabled:to-primary-400 disabled:shadow-none",
              "transition-all duration-200"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Evaluating…
              </>
            ) : (
              <>
                Submit Response
                <Send className="h-3.5 w-3.5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Render text-based checkpoint (submissionType === 'text' or no questions provided)
  if (
    step.step_type === 'checkpoint' &&
    (step.content.submissionType === 'text' ||
      !step.content.questions ||
      step.content.questions.length === 0)
  ) {
    const prompts = step.content.reflectionPrompts && step.content.reflectionPrompts.length > 0
      ? step.content.reflectionPrompts
      : step.content.instructions
      ? [step.content.instructions]
      : ['Reflect on what you have learned in this module.'];

    return (
      <div className={contentCardClass}>
        {renderSubmittingOverlay()}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />

        {renderEyebrow()}

        {renderPreviousScoreBanner() && <div className="mt-5">{renderPreviousScoreBanner()}</div>}

        <div className="space-y-4">
          {prompts.map((prompt, index) => (
            <p key={index} className="font-bitter text-xl sm:text-2xl leading-snug text-primary-900">
              {prompt}
            </p>
          ))}
        </div>

        <div className="mt-7">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-muted mb-2">
            Your response
          </label>
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Begin writing here…"
            className={cn(
              "min-h-[180px] rounded-xl border-primary-300/50 bg-white/80",
              "text-[15px] leading-relaxed text-neutral-text placeholder:text-neutral-muted/60",
              "shadow-[inset_0_1px_2px_0_rgba(184,134,11,0.06)]",
              "focus-visible:ring-2 focus-visible:ring-primary-400/40 focus-visible:ring-offset-0",
              "focus-visible:border-primary-500/70"
            )}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="text-[11px] text-neutral-muted/70">
            {response.trim() ? `${response.trim().split(/\s+/).length} words` : 'Take your time.'}
          </span>
          <Button
            onClick={handleTextSubmit}
            disabled={!response.trim() || isSubmitting}
            size="lg"
            className={cn(
              "min-w-[180px] bg-gradient-to-br from-primary-400 to-primary-600 text-white",
              "shadow-[0_6px_20px_-6px_rgba(184,134,11,0.5)]",
              "hover:from-primary-500 hover:to-primary-700 hover:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)]",
              "disabled:from-primary-300 disabled:to-primary-400 disabled:shadow-none",
              "transition-all duration-200"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Evaluating…
              </>
            ) : (
              <>
                Submit Response
                <Send className="h-3.5 w-3.5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Render quiz/checkpoint (multiple-choice)
  if (step.step_type === 'quiz' || step.step_type === 'checkpoint') {
    const questions = step.content.questions || [];
    const allAnswered = questions.every(q => quizAnswers[q.id]);

    return (
      <div className={contentCardClass}>
        {renderSubmittingOverlay()}

        {/* Top hairline accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />

        {renderEyebrow()}

        {renderPreviousScoreBanner() && <div className="mt-5">{renderPreviousScoreBanner()}</div>}

        {step.content.instructions && (
          <p className="mt-4 text-sm leading-relaxed text-neutral-muted">
            {step.content.instructions}
          </p>
        )}

        {/* Editorial questions */}
        <div className="mt-7 space-y-7">
          {questions.map((question, qIndex) => (
            <div key={question.id} className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="font-bitter text-xl font-semibold text-primary-600 tabular-nums shrink-0">
                  {String(qIndex + 1).padStart(2, "0")}
                </span>
                <p className="font-bitter text-lg leading-snug text-primary-900">
                  {question.question}
                </p>
              </div>
              <RadioGroup
                value={quizAnswers[question.id] || ''}
                onValueChange={(value) => setQuizAnswers(prev => ({
                  ...prev,
                  [question.id]: value
                }))}
                className="space-y-2 pl-8"
              >
                {(['A', 'B', 'C', 'D'] as const).map((option) => {
                  const isSelected = quizAnswers[question.id] === option;
                  return (
                    <Label
                      key={option}
                      htmlFor={`${question.id}-${option}`}
                      className={cn(
                        "group flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-150",
                        isSelected
                          ? "border-primary-500/70 bg-brand-light shadow-[inset_0_0_0_1px_rgba(184,134,11,0.15)]"
                          : "border-primary-300/30 bg-white/60 hover:border-primary-400/50 hover:bg-brand-light/40"
                      )}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`${question.id}-${option}`}
                        className="flex-shrink-0 border-primary-400 text-primary-600"
                      />
                      <span
                        className={cn(
                          "font-bitter text-sm font-semibold tabular-nums w-4 shrink-0",
                          isSelected ? "text-primary-700" : "text-primary-500/70"
                        )}
                      >
                        {option}
                      </span>
                      <span className="flex-1 text-sm text-neutral-text">
                        {question.options[option]}
                      </span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </div>
          ))}
        </div>

        {/* Action row */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-primary-300/30 pt-5">
          <span className="text-[11px] text-neutral-muted/70 tabular-nums">
            {Object.keys(quizAnswers).length} of {questions.length} answered
          </span>
          <Button
            onClick={handleQuizSubmit}
            disabled={!allAnswered || isSubmitting}
            size="lg"
            className={cn(
              "min-w-[180px] bg-gradient-to-br from-primary-400 to-primary-600 text-white",
              "shadow-[0_6px_20px_-6px_rgba(184,134,11,0.5)]",
              "hover:from-primary-500 hover:to-primary-700 hover:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)]",
              "disabled:from-primary-300 disabled:to-primary-400 disabled:shadow-none",
              "transition-all duration-200"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Evaluating…
              </>
            ) : (
              <>
                Submit Answers
                <Send className="h-3.5 w-3.5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
