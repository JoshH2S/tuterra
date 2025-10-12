import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XPGainNotificationProps } from "@/types/skills";
import { cn } from "@/lib/utils";
import { 
  X, 
  Zap, 
  TrendingUp, 
  Award,
  Sparkles
} from "lucide-react";

export function XPGainNotification({ 
  skillName, 
  xpGained, 
  newLevel, 
  isVisible, 
  onClose 
}: XPGainNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      // Trigger animation after component mounts
      const timer = setTimeout(() => setIsAnimating(true), 100);
      
      // Auto-close after 4 seconds
      const closeTimer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    } else {
      handleClose();
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShouldShow(false);
      onClose();
    }, 300);
  };

  if (!shouldShow) return null;

  const isLevelUp = newLevel !== undefined;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <Card 
        className={cn(
          "pointer-events-auto w-80 border-l-4 shadow-lg transition-all duration-300 ease-out",
          isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
          isLevelUp ? "border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50" : "border-l-blue-500 bg-blue-50"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {isLevelUp ? (
                  <Award className="h-5 w-5 text-yellow-600" />
                ) : (
                  <Zap className="h-5 w-5 text-blue-600" />
                )}
                <h4 className="font-semibold text-sm">
                  {isLevelUp ? "Level Up!" : "XP Gained!"}
                </h4>
              </div>

              <p className="text-sm text-gray-700 mb-3">
                <span className="font-medium">{skillName}</span>
                {isLevelUp ? (
                  <span> reached level {newLevel}!</span>
                ) : (
                  <span> gained {xpGained} XP</span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    isLevelUp ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                  )}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{xpGained} XP
                </Badge>
                
                {isLevelUp && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Level {newLevel}
                  </Badge>
                )}
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
