
import { ReactNode } from "react";
import { Sparkles, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PremiumFeatureBadgeProps {
  feature: string;
  tier?: "pro" | "premium";
  className?: string;
}

export const PremiumFeatureBadge = ({ feature, tier = "premium", className }: PremiumFeatureBadgeProps) => {
  const featureLabels: Record<string, string> = {
    "advanced-analysis": "Advanced Analysis",
    "industry-benchmarks": "Industry Benchmarks",
    "personalized-feedback": "AI Feedback",
    "export-pdf": "PDF Export",
    "detailed-explanations": "Detailed Explanations",
    "unlimited-assessments": "Unlimited Assessments"
  };

  const featureLabel = featureLabels[feature] || feature;

  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium", 
      tier === "premium" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" 
        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      className
    )}>
      <Sparkles className={cn(
        "mr-1 h-3 w-3", 
        tier === "premium" ? "text-amber-500" : "text-blue-500"
      )} />
      {featureLabel}
    </div>
  );
};

interface PremiumFeatureProps {
  children: ReactNode;
  feature: string;
  tier?: "pro" | "premium";
  userTier?: string;
  tooltipText?: string;
  locked?: boolean;
}

export const PremiumFeature = ({ 
  children, 
  feature, 
  tier = "premium", 
  userTier,
  tooltipText,
  locked = false
}: PremiumFeatureProps) => {
  // Always set locked to false, making features available to all users
  locked = false;

  return (
    <div className={cn(
      "relative rounded-lg border",
      locked ? "opacity-75" : ""
    )}>
      <div className="absolute top-2 right-2">
        <PremiumFeatureBadge feature={feature} tier={tier} />
      </div>
      
      {locked ? (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 rounded-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-8 w-8 text-muted-foreground mb-2" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="sm">Upgrade</Button>
        </div>
      ) : null}
      
      {children}
    </div>
  );
};

interface AdvancedAnalysisSectionProps {
  userTier?: string;
  skills?: { name: string; score: number }[];
  recommendations?: string[];
  benchmarks?: { industry: string; role: string; averageScore: number }[];
}

export const AdvancedAnalysisSection = ({ 
  userTier = "free",
  skills = [],
  recommendations = [],
  benchmarks = []
}: AdvancedAnalysisSectionProps) => {
  // Override the tier check logic to make features available to all
  const isPremium = true;
  const isPro = true;

  return (
    <div className="space-y-6">
      <PremiumFeature 
        feature="advanced-analysis" 
        tier="pro"
        userTier={userTier}
        locked={false}
      >
        <div className="p-4">
          <h3 className="text-lg font-medium mb-3">Skill Gap Analysis</h3>
          <div className="space-y-2">
            {skills.length > 0 ? skills.map((skill, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{skill.name}</span>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      skill.score > 80 ? "bg-green-500" :
                      skill.score > 50 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-3 text-muted-foreground">
                <p>Complete an assessment to view your skill analysis</p>
              </div>
            )}
          </div>
        </div>
      </PremiumFeature>

      <PremiumFeature 
        feature="personalized-feedback" 
        tier="pro"
        userTier={userTier}
        locked={false}
      >
        <div className="p-4">
          <h3 className="text-lg font-medium mb-3">Personalized Recommendations</h3>
          {recommendations.length > 0 ? (
            <ul className="space-y-2 list-disc pl-5">
              {recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-3 text-muted-foreground">
              <p>Complete an assessment to receive personalized recommendations</p>
            </div>
          )}
        </div>
      </PremiumFeature>

      <PremiumFeature 
        feature="industry-benchmarks" 
        tier="premium"
        userTier={userTier}
        locked={false}
      >
        <div className="p-4">
          <h3 className="text-lg font-medium mb-3">Industry Benchmarks</h3>
          {benchmarks.length > 0 ? (
            <div className="space-y-3">
              {benchmarks.map((benchmark, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{benchmark.role} in {benchmark.industry}</span>
                  <span className="font-medium">{benchmark.averageScore}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-muted-foreground">
              <p>Compare your results with industry averages</p>
            </div>
          )}
        </div>
      </PremiumFeature>
    </div>
  );
};
