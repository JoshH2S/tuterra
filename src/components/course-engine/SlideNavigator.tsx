import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentSlide } from "@/types/course-engine";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SlideNavigatorProps {
  slides: ContentSlide[];
  onComplete?: () => void;
  autoMarkComplete?: boolean;
  isSubmitting?: boolean;
}

export function SlideNavigator({
  slides,
  onComplete,
  autoMarkComplete = true,
  isSubmitting = false,
}: SlideNavigatorProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewedSlides, setViewedSlides] = useState<Set<number>>(new Set([0]));

  const currentSlide = slides[currentSlideIndex];
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === slides.length - 1;

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      setViewedSlides(prev => new Set(prev).add(nextIndex));
    } else if (isLastSlide && autoMarkComplete && onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setViewedSlides(prev => new Set(prev).add(index));
  };

  const allSlidesViewed = viewedSlides.size === slides.length;

  return (
    <div className="space-y-6">
      {/* Slide pagination — segmented gold pills */}
      <div className="flex items-center justify-center gap-1.5" role="tablist">
        {slides.map((_, index) => {
          const isActive = index === currentSlideIndex;
          const isViewed = viewedSlides.has(index);
          return (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                isActive
                  ? "w-8 bg-gradient-to-r from-primary-400 to-primary-600"
                  : isViewed
                  ? "w-2 bg-primary-500/70 hover:bg-primary-600"
                  : "w-2 bg-primary-300/40 hover:bg-primary-300/70"
              )}
            />
          );
        })}
      </div>

      {/* Slide card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden rounded-2xl border border-primary-300/40",
            "bg-gradient-to-b from-white to-brand-light/30 p-7 sm:p-9",
            "shadow-[0_8px_32px_-12px_rgba(184,134,11,0.18),0_2px_8px_-2px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
          )}
        >
          {/* Top hairline accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />

          {/* Page number eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <span className="font-bitter text-xs font-semibold tabular-nums text-primary-600">
              {String(currentSlideIndex + 1).padStart(2, "0")}
              <span className="mx-1 text-primary-300">/</span>
              {String(slides.length).padStart(2, "0")}
            </span>
            <span className="h-px w-6 bg-primary-300/60" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-muted">
              Page
            </span>
          </div>

          {/* Slide title */}
          {currentSlide.title && (
            <h2 className="font-bitter text-2xl sm:text-3xl font-semibold leading-tight text-primary-900 mb-5">
              {currentSlide.title}
            </h2>
          )}

          {/* Slide content */}
          <div className="prose prose-sm max-w-none">
            <div className="font-bitter text-[16px] leading-[1.75] text-neutral-text whitespace-pre-wrap">
              {currentSlide.content}
            </div>
          </div>

          {/* Key Takeaways */}
          {currentSlide.keyPoints && currentSlide.keyPoints.length > 0 && (
            <div className="mt-8 border-t border-primary-300/30 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-3.5 w-3.5 text-primary-500" />
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-700">
                  Key Takeaways
                </h3>
              </div>
              <ul className="space-y-3">
                {currentSlide.keyPoints.map((point, index) => (
                  <li key={index} className="flex gap-3 text-sm leading-relaxed text-neutral-text">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Slide navigation */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrevious}
          disabled={isFirstSlide}
          className={cn(
            "group flex items-center gap-2 text-sm font-medium transition-colors",
            isFirstSlide
              ? "text-neutral-muted/40 cursor-not-allowed"
              : "text-neutral-muted hover:text-primary-700"
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Previous page</span>
          <span className="sm:hidden">Prev</span>
        </button>

        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-muted/70 tabular-nums hidden sm:inline">
          {currentSlideIndex + 1} of {slides.length}
        </span>

        {isLastSlide ? (
          <Button
            onClick={handleNext}
            disabled={!allSlidesViewed || isSubmitting}
            size="lg"
            className={cn(
              "min-w-[200px] bg-gradient-to-br from-primary-400 to-primary-600 text-white",
              "shadow-[0_6px_20px_-6px_rgba(184,134,11,0.5)]",
              "hover:from-primary-500 hover:to-primary-700 hover:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)]",
              "disabled:from-primary-300 disabled:to-primary-400 disabled:shadow-none",
              "transition-all duration-200"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completing…
              </>
            ) : (
              <>
                {autoMarkComplete ? "Continue to Next Step" : "Mark Complete"}
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <button
            onClick={handleNext}
            className="group flex items-center gap-2 text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
          >
            <span className="hidden sm:inline">Next page</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Helpful notice */}
      {isLastSlide && !allSlidesViewed && (
        <p className="text-center text-xs italic text-neutral-muted">
          Please review all pages before continuing.
        </p>
      )}
    </div>
  );
}
