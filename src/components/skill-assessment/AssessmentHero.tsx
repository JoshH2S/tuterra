
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AssessmentHeroProps {
  onCreateNew: () => void;
}

export const AssessmentHero = ({ onCreateNew }: AssessmentHeroProps) => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative">
      <div className="bg-gradient-to-r from-black/20 via-black/10 to-black/5 rounded-lg sm:rounded-xl md:rounded-3xl p-4 sm:p-6 md:p-10 w-full backdrop-blur-sm">
        <div className="max-w-2xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">Skill Assessments</h1>
          <p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-white/90">
            Track your professional growth with AI-powered skill assessments tailored to your industry.
          </p>
          <Button className="mt-3 sm:mt-4 md:mt-6" size={isMobile ? "sm" : "default"} onClick={onCreateNew}>
            <Plus className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Create Assessment
          </Button>
        </div>
        
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block">
          <AssessmentStatsPreview />
        </div>
      </div>
    </section>
  );
};

const AssessmentStatsPreview = () => (
  <div className="rounded-xl bg-white/95 backdrop-blur-md p-4 shadow-lg border border-white/20 w-[240px]">
    <div className="space-y-2">
      <div className="h-2 w-24 bg-blue-500/30 rounded-full" />
      <div className="h-2 w-32 bg-gray-300 rounded-full" />
      <div className="h-2 w-16 bg-gray-300 rounded-full" />
      <div className="h-8 mt-4 bg-gray-200 rounded-md" />
    </div>
  </div>
);
