import { Loader2, Sparkles, BookOpen, MessageSquare, Award } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface ModuleGenerationLoadingProps {
  moduleTitle?: string;
}

export function ModuleGenerationLoading({ moduleTitle }: ModuleGenerationLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Sparkles, text: "Analyzing your learning path..." },
    { icon: BookOpen, text: "Crafting personalized lessons..." },
    { icon: MessageSquare, text: "Generating interactive questions..." },
    { icon: Award, text: "Preparing assessments..." },
  ];

  useEffect(() => {
    // Simulate progress over ~15 seconds
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Stop at 95% until real completion
        return prev + 1;
      });
    }, 150);

    // Cycle through steps every 3.5 seconds
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <PremiumCard className="max-w-md w-full p-8">
        <div className="text-center space-y-6">
          {/* Tuterra Logo */}
          <div className="relative mx-auto w-28 h-28">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
            <div className="relative flex items-center justify-center w-28 h-28 bg-primary/5 rounded-full">
              <img
                src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
                alt="Tuterra Logo"
                className="h-14 w-auto object-contain animate-pulse"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              Generating Your Module
            </h3>
            {moduleTitle && (
              <p className="text-sm text-muted-foreground font-medium">
                {moduleTitle}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progress}% complete
            </p>
          </div>

          {/* Current Step */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{steps[currentStep].text}</span>
          </div>

          {/* Tip */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              💡 <span className="font-medium">Tip:</span> Your personalized content
              is being created using AI to match your learning level and goals.
            </p>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}

