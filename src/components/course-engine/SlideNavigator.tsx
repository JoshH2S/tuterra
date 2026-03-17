import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Lightbulb, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { ContentSlide } from "@/types/course-engine";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SlideNavigatorProps {
  slides: ContentSlide[];
  onComplete?: () => void;
  autoMarkComplete?: boolean; // If true, marks as complete when reaching last slide
  isSubmitting?: boolean; // Loading state for completion
}

export function SlideNavigator({ slides, onComplete, autoMarkComplete = true, isSubmitting = false }: SlideNavigatorProps) {
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
      {/* Slide Progress Indicators */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "transition-all duration-200",
              index === currentSlideIndex && "scale-125"
            )}
            aria-label={`Go to slide ${index + 1}`}
          >
            {viewedSlides.has(index) ? (
              <Circle
                className={cn(
                  "h-2.5 w-2.5",
                  index === currentSlideIndex 
                    ? "fill-primary text-primary" 
                    : "fill-primary/40 text-primary/40"
                )}
              />
            ) : (
              <Circle className="h-2 w-2 text-muted-foreground/40" />
            )}
          </button>
        ))}
      </div>

      {/* Slide Content with Animation - floating white card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-xl bg-white p-6 space-y-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08),0_8px_24px_-4px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.8)]"
        >
          {/* Slide Title */}
          {currentSlide.title && (
            <div>
              <h2 className="text-2xl font-bold text-[#091747] mb-2">
                {currentSlide.title}
              </h2>
              <div className="h-1 w-20 bg-primary rounded-full" />
            </div>
          )}

          {/* Slide Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-700">
              {currentSlide.content}
            </div>
          </div>

          {/* Key Points */}
          {currentSlide.keyPoints && currentSlide.keyPoints.length > 0 && (
            <PremiumCard className="p-5 bg-primary/5 border-primary/20">
              <h3 className="font-semibold flex items-center gap-2 mb-4 text-[#091747]">
                <Lightbulb className="h-5 w-5 text-primary" />
                Key Takeaways
              </h3>
              <ul className="space-y-3">
                {currentSlide.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{point}</span>
                  </li>
                ))}
              </ul>
            </PremiumCard>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstSlide}
          size="sm"
          className="gap-1.5 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
          {currentSlideIndex + 1} / {slides.length}
        </span>

        {isLastSlide ? (
          <Button
            onClick={handleNext}
            disabled={!allSlidesViewed || isSubmitting}
            size="sm"
            className="gap-1.5 shrink-0"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="hidden sm:inline">Completing...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{autoMarkComplete ? "Continue to Next Step" : "Complete"}</span>
                <span className="sm:hidden">{autoMarkComplete ? "Next Step" : "Complete"}</span>
                <CheckCircle className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} size="sm" className="gap-1.5 shrink-0">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Helpful message */}
      {isLastSlide && !allSlidesViewed && (
        <p className="text-sm text-center text-amber-700 bg-amber-50 p-3 rounded-lg">
          💡 Please review all slides before continuing
        </p>
      )}
    </div>
  );
}

