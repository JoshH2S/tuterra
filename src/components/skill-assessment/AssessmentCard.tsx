
import React, { useMemo } from "react";
import { Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { AssessmentCardProps } from "./types";

const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment, onViewAssessment }) => {
  const isMobile = useIsMobile();
  
  // Extract unique skills from questions with memoization
  const skills = useMemo(() => {
    return assessment.questions
      ?.map(q => q.skill)
      .filter((value, index, self) => 
        value && self.indexOf(value) === index
      ) || [];
  }, [assessment.questions]);
  
  // In a real app, this would come from user progress data
  const completionRate = useMemo(() => Math.floor(Math.random() * 100), [assessment.id]);
  
  const handleClick = () => {
    onViewAssessment(assessment.id);
  };
  
  return (
    <Card className="h-full transition-all hover:shadow-md active:scale-[0.98] touch-manipulation w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold line-clamp-1">
              {assessment.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
              <Building2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              {assessment.industry}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm whitespace-nowrap self-start">
            {assessment.role}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4 sm:pb-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Skills Preview */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {skills.slice(0, isMobile ? 2 : 3).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs truncate max-w-[120px]"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > (isMobile ? 2 : 3) && (
              <Badge variant="secondary" className="text-xs">
                +{skills.length - (isMobile ? 2 : 3)} more
              </Badge>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Questions</span>
              <span className="font-medium">
                {assessment.questions?.length || 0} total
              </span>
            </div>
            <Progress 
              value={completionRate} 
              className="h-1.5 sm:h-2"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-1 sm:pt-2">
        <Button 
          variant="outline" 
          className="w-full text-xs sm:text-sm py-1 sm:py-2"
          onClick={handleClick}
        >
          Take Assessment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default React.memo(AssessmentCard);
