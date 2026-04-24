import { useEffect, useState } from "react";
import { ArrowRight, RotateCcw, Sparkles, Compass, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIFeedback } from "@/types/course-engine";
import { cn } from "@/lib/utils";

interface FeedbackDisplayProps {
  feedback: AIFeedback;
  isPassing: boolean;
  onContinue: () => void;
  onRetry: () => void;
}

export function FeedbackDisplay({ feedback, isPassing, onContinue, onRetry }: FeedbackDisplayProps) {
  const targetScore = feedback.overallScore ?? 0;
  const [displayScore, setDisplayScore] = useState(0);

  // Animate the score number count-up
  useEffect(() => {
    if (targetScore === 0) return;
    const duration = 900;
    const start = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(targetScore * eased));
      if (t < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [targetScore]);

  const scoreLabel = (() => {
    if (targetScore >= 90) return "Excellent";
    if (targetScore >= 75) return "Well done";
    if (targetScore >= 60) return "On your way";
    if (targetScore >= 40) return "Keep building";
    return "Needs another pass";
  })();

  // SVG ring geometry
  const size = 176;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, targetScore));
  const dashOffset = circumference - (progress / 100) * circumference;

  const ringGradientId = isPassing ? "gradPass" : "gradFail";
  const ringFromColor = isPassing ? "#DAA520" : "#C68642";
  const ringToColor = isPassing ? "#B8860B" : "#8B4513";

  const hasStrengths = feedback.strengths && feedback.strengths.length > 0;
  const hasImprovements = feedback.improvements && feedback.improvements.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Hero score */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-300/40 bg-gradient-to-b from-brand-light to-white px-6 py-10 text-center shadow-[0_8px_32px_-8px_rgba(184,134,11,0.15),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-300/60 to-transparent" />

        <div className="relative inline-flex items-center justify-center">
          <svg width={size} height={size} className="-rotate-90">
            <defs>
              <linearGradient id={ringGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={ringFromColor} />
                <stop offset="100%" stopColor={ringToColor} />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(45, 40%, 90%)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#${ringGradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1000ms cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-bitter text-5xl font-semibold tracking-tight text-primary-700 tabular-nums">
              {displayScore}
              <span className="ml-0.5 text-2xl text-primary-500">%</span>
            </span>
            <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-primary-600/80">
              {isPassing ? "Passing score" : "Current score"}
            </span>
          </div>
        </div>

        <p className="mt-6 font-bitter text-xl text-primary-800">{scoreLabel}</p>
      </div>

      {/* Feedback pull quote */}
      {feedback.feedback && (
        <div className="relative pl-5">
          <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-primary-400 to-primary-600" />
          <p className="font-bitter text-lg leading-relaxed text-neutral-text">
            {feedback.feedback}
          </p>
        </div>
      )}

      {/* Strengths + Improvements — editorial two-column */}
      {(hasStrengths || hasImprovements) && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {hasStrengths && (
            <section>
              <div className="mb-3 flex items-center gap-2 border-b border-primary-300/40 pb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-700">
                  Strengths
                </h3>
              </div>
              <ul className="space-y-3">
                {feedback.strengths!.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-neutral-text">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-500" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasImprovements && (
            <section>
              <div className="mb-3 flex items-center gap-2 border-b border-secondary-300/50 pb-2">
                <Compass className="h-3.5 w-3.5 text-secondary-500" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary-600">
                  Areas to refine
                </h3>
              </div>
              <ul className="space-y-3">
                {feedback.improvements!.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-neutral-text">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-secondary-400" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Concepts to review — refined chips */}
      {feedback.conceptsToReview && feedback.conceptsToReview.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <BookMarked className="h-3.5 w-3.5 text-primary-600" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-700">
              Concepts to revisit
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {feedback.conceptsToReview.map((c, i) => (
              <span
                key={i}
                className="font-bitter rounded-full border border-primary-300/60 bg-brand-light px-3.5 py-1 text-sm text-primary-800"
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Next-step guidance */}
      {feedback.nextStepGuidance && (
        <p className="border-t border-primary-300/30 pt-6 text-center text-sm italic text-neutral-muted">
          {feedback.nextStepGuidance}
        </p>
      )}

      {/* Retry notice when failing */}
      {!isPassing && (
        <div className="rounded-xl border border-secondary-300/60 bg-secondary-100/50 px-5 py-4 text-sm leading-relaxed text-secondary-700">
          <span className="font-semibold text-secondary-800">A passing score is required to continue.</span>{" "}
          Review the feedback above, then try again — your previous response is saved so you can refine it.
        </div>
      )}

      {/* Action */}
      <div className="flex justify-center pt-2">
        {isPassing ? (
          <Button
            onClick={onContinue}
            size="lg"
            className={cn(
              "min-w-[180px] bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-[0_6px_20px_-6px_rgba(184,134,11,0.5)]",
              "hover:from-primary-500 hover:to-primary-700 hover:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)]",
              "transition-all duration-200"
            )}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onRetry}
            size="lg"
            variant="outline"
            className="min-w-[180px] border-primary-300 text-primary-700 hover:bg-brand-light hover:text-primary-800"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
