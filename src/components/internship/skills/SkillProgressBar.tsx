import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { SkillProgressBarProps } from "@/types/skills";

export function SkillProgressBar({ 
  currentXp, 
  currentLevel, 
  xpPerLevel, 
  maxLevel, 
  color = "#3B82F6",
  showLabels = true 
}: SkillProgressBarProps) {
  // Calculate progress within current level
  const xpInCurrentLevel = currentXp % xpPerLevel;
  const progressPercentage = (xpInCurrentLevel / xpPerLevel) * 100;
  
  // Calculate next level XP requirement
  const xpForNextLevel = xpPerLevel - xpInCurrentLevel;
  
  // Check if at max level
  const isMaxLevel = currentLevel >= maxLevel;

  return (
    <div className="space-y-2">
      {showLabels && (
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">
            Level {currentLevel}
            {!isMaxLevel && <span className="text-muted-foreground"> → {currentLevel + 1}</span>}
          </span>
          <span className="text-muted-foreground">
            {isMaxLevel ? "Max Level" : `${xpForNextLevel} XP to next level`}
          </span>
        </div>
      )}
      
      <div className="space-y-1">
        <Progress 
          value={isMaxLevel ? 100 : progressPercentage} 
          className="h-3"
          indicatorClassName={cn(
            "transition-all duration-500 ease-out",
            isMaxLevel && "bg-gradient-to-r from-yellow-400 to-yellow-600"
          )}
          style={{
            '--progress-color': color
          } as React.CSSProperties}
        />
        
        {showLabels && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{xpInCurrentLevel} XP</span>
            <span>{isMaxLevel ? "Mastered" : `${xpPerLevel} XP`}</span>
          </div>
        )}
      </div>
    </div>
  );
}
