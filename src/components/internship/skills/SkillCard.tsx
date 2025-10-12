import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkillProgressBar } from "./SkillProgressBar";
import { SkillCardProps } from "@/types/skills";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  Award, 
  FileText, 
  Eye,
  Zap
} from "lucide-react";

export function SkillCard({ skill, progress, onClick }: SkillCardProps) {
  const isMaxLevel = progress.current_level >= skill.max_level;
  const hasEvidence = progress.evidence_submissions.length > 0;
  
  // Calculate skill tier based on level
  const getSkillTier = (level: number, maxLevel: number) => {
    const percentage = (level / maxLevel) * 100;
    if (percentage >= 80) return { name: "Expert", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    if (percentage >= 60) return { name: "Advanced", color: "bg-purple-100 text-purple-800 border-purple-200" };
    if (percentage >= 40) return { name: "Intermediate", color: "bg-blue-100 text-blue-800 border-blue-200" };
    if (percentage >= 20) return { name: "Beginner", color: "bg-green-100 text-green-800 border-green-200" };
    return { name: "Novice", color: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  const skillTier = getSkillTier(progress.current_level, skill.max_level);

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        "border-l-4 hover:border-l-primary",
        onClick && "hover:bg-accent/20"
      )}
      style={{ borderLeftColor: skill.color }}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span>{skill.name}</span>
              {isMaxLevel && (
                <Award className="h-4 w-4 text-yellow-500" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {skill.description}
            </p>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn("ml-2 flex-shrink-0", skillTier.color)}
          >
            {skillTier.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <SkillProgressBar
          currentXp={progress.current_xp}
          currentLevel={progress.current_level}
          xpPerLevel={skill.xp_per_level}
          maxLevel={skill.max_level}
          color={skill.color}
          showLabels={true}
        />

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>{progress.current_xp} XP</span>
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>{progress.total_submissions} submission{progress.total_submissions !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {hasEvidence && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Evidence
            </Button>
          )}
        </div>

        {/* Recent Activity */}
        {progress.last_activity && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t">
            <TrendingUp className="h-3 w-3" />
            <span>
              Last activity: {new Date(progress.last_activity).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
