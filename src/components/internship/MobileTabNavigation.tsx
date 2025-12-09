import { BarChart2, CheckSquare, Calendar, MessageSquare, Building, MessageCircle, Target, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileTabNavigationProps {
  activeIndex: number;
  onTabChange: (index: number) => void;
  canSubmitFinal: boolean;
  isCompleted: boolean;
}

const tabs = [
  { name: "Overview", icon: BarChart2, shortName: "Overview" },
  { name: "Tasks", icon: CheckSquare, shortName: "Tasks" },
  { name: "Calendar", icon: Calendar, shortName: "Calendar" },
  { name: "Messages", icon: MessageSquare, shortName: "Messages" },
  { name: "Company", icon: Building, shortName: "Company" },
  { name: "Feedback", icon: MessageCircle, shortName: "Feedback" },
  { name: "Skills", icon: Target, shortName: "Skills" },
  { name: "Final Project", icon: GraduationCap, shortName: "Final" },
];

export function MobileTabNavigation({ 
  activeIndex, 
  onTabChange, 
  canSubmitFinal, 
  isCompleted 
}: MobileTabNavigationProps) {
  return (
    <div className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10">
      {/* Current Section Label */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {tabs[activeIndex] && (
                <>
                  {(() => {
                    const IconComponent = tabs[activeIndex].icon;
                    return <IconComponent className="h-4 w-4 text-primary" />;
                  })()}
                  <span className="font-medium text-sm">{tabs[activeIndex].name}</span>
                </>
              )}
            </div>
            {/* Final Project Status Badge */}
            {activeIndex === 7 && (
              <>
                {isCompleted && (
                  <Badge variant="default" className="text-xs px-1.5 py-0 bg-green-500 text-white">
                    ✓ Complete
                  </Badge>
                )}
                {!isCompleted && canSubmitFinal && (
                  <Badge variant="default" className="text-xs px-1.5 py-0 bg-green-500 text-white">
                    Ready
                  </Badge>
                )}
                {!isCompleted && !canSubmitFinal && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    Locked
                  </Badge>
                )}
              </>
            )}
          </div>
          
          {/* Progress Indicator */}
          <div className="text-xs text-muted-foreground">
            {activeIndex + 1} of {tabs.length}
          </div>
        </div>
      </div>
      
      {/* Scrollable Tab Bar - Horizontal scrollable pills */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-2 min-w-max">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = index === activeIndex;
            const isFinalProject = index === 7;
            
            return (
              <button
                key={index}
                onClick={() => !isFinalProject || canSubmitFinal || isCompleted ? onTabChange(index) : null}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted/60 hover:bg-muted text-muted-foreground",
                  isFinalProject && !canSubmitFinal && !isCompleted && "opacity-50 cursor-not-allowed"
                )}
                disabled={isFinalProject && !canSubmitFinal && !isCompleted}
              >
                <Icon className="h-3 w-3" />
                <span>{tab.shortName}</span>
                
                {/* Status indicators for Final Project */}
                {isFinalProject && (
                  <>
                    {isCompleted && (
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    )}
                    {!isCompleted && canSubmitFinal && (
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    )}
                    {!isCompleted && !canSubmitFinal && (
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Dot Progress Indicator */}
      <div className="flex justify-center gap-1 py-2 bg-gray-50/50">
        {tabs.map((_, index) => (
          <button
            key={index}
            onClick={() => onTabChange(index)}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              index === activeIndex 
                ? "bg-primary scale-125" 
                : "bg-gray-300 hover:bg-gray-400"
            )}
            aria-label={`Go to ${tabs[index].name}`}
          />
        ))}
      </div>
    </div>
  );
}
