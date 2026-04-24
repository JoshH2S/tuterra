import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ModuleGenerationLoadingProps {
  moduleTitle?: string;
}

export function ModuleGenerationLoading({ moduleTitle }: ModuleGenerationLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Analyzing your learning path",
    "Crafting personalized lessons",
    "Composing interactive questions",
    "Preparing assessments",
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + 1;
      });
    }, 150);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1308]/50 backdrop-blur-sm p-4">
      <div
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-2xl border border-primary-300/50",
          "bg-gradient-to-b from-brand-light to-white",
          "shadow-[0_24px_60px_-12px_rgba(74,52,3,0.3),0_8px_24px_-8px_rgba(184,134,11,0.2),inset_0_1px_0_0_rgba(255,255,255,0.9)]",
          "animate-in fade-in zoom-in-95 duration-300"
        )}
      >
        {/* Top hairline accent */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary-400 to-transparent" />

        <div className="px-8 pt-10 pb-8">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="font-bitter text-xs font-semibold uppercase tracking-[0.25em] text-primary-600">
              Preparing Chapter
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-primary-300/60 to-transparent" />
          </div>

          {/* Headline */}
          <h2 className="mt-5 font-bitter text-3xl font-semibold leading-tight text-primary-900">
            Composing your module
          </h2>

          {moduleTitle && (
            <p className="mt-3 font-bitter text-base italic leading-relaxed text-neutral-text">
              {moduleTitle}
            </p>
          )}

          {/* Animated pen-line divider */}
          <div className="mt-8 flex items-center gap-4">
            <span className="h-px flex-1 bg-primary-300/40" />
            <span className="h-1 w-1 rotate-45 bg-primary-400 animate-pulse" />
            <span className="h-px flex-1 bg-primary-300/40" />
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <span
                key={currentStep}
                className="text-sm italic text-neutral-text animate-in fade-in duration-500"
              >
                {steps[currentStep]}…
              </span>
              <span className="text-[11px] font-semibold tabular-nums uppercase tracking-[0.18em] text-primary-600">
                {progress}%
              </span>
            </div>
            <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-primary-300/20">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
              {/* Shimmer sweep */}
              <div
                className="absolute inset-y-0 w-16 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2s_ease-in-out_infinite]"
                style={{
                  animation: "shimmer 2s ease-in-out infinite",
                  left: `${Math.max(0, progress - 16)}%`,
                }}
              />
            </div>
          </div>

          {/* Four-step indicator dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === currentStep
                    ? "w-8 bg-gradient-to-r from-primary-400 to-primary-600"
                    : i < currentStep
                    ? "w-1.5 bg-primary-500/70"
                    : "w-1.5 bg-primary-300/40"
                )}
              />
            ))}
          </div>

          {/* Quiet note */}
          <p className="mt-8 border-t border-primary-300/30 pt-5 text-center text-xs italic text-neutral-muted">
            Tailoring content to your level and goals. This takes just a moment.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(400%); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
