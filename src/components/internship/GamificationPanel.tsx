
import { PremiumCard } from "@/components/ui/premium-card";
import { InternshipSession } from "@/pages/VirtualInternshipDashboard";
import { InternshipTask } from "./SwipeableInternshipView";
import { differenceInDays } from "date-fns";

interface GamificationPanelProps {
  sessionData: InternshipSession;
  tasks: InternshipTask[];
}

// Mock badges - we'll use task completion to determine which badges are achieved
const baseBadges = [
  {
    id: 1,
    name: "Fast Learner",
    description: "Completed first assignment ahead of schedule",
    icon: "🚀"
  },
  {
    id: 2,
    name: "Team Player",
    description: "Collaborated on 5+ team projects",
    icon: "🤝"
  },
  {
    id: 3,
    name: "Data Wizard",
    description: "Mastered advanced data analysis tools",
    icon: "📊"
  },
  {
    id: 4,
    name: "Innovation Champion",
    description: "Suggested creative solution that was implemented",
    icon: "💡"
  },
];

export function GamificationPanel({ sessionData, tasks }: GamificationPanelProps) {
  // Calculate badges based on tasks completed
  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
  
  // Determine which badges are achieved based on task completion
  const badges = baseBadges.map((badge, index) => {
    // For demo purposes, first two badges are achieved if at least 1 or 2 tasks are completed
    const achieved = index === 0 ? completedTasksCount >= 1 : 
                     index === 1 ? completedTasksCount >= 2 : false;
    return { ...badge, achieved };
  });

  // Calculate current streak (days with completed tasks)
  const streakDays = Math.min(7, Math.max(1, completedTasksCount));

  return (
    <PremiumCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        
        <div className="grid grid-cols-2 gap-3 mb-5">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className={`text-center p-3 rounded-lg border ${
                badge.achieved 
                  ? "border-primary/20 bg-primary/10" 
                  : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-60"
              }`}
            >
              <div className="text-3xl mb-1">{badge.icon}</div>
              <h3 className="font-medium text-sm">{badge.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Streak tracker */}
        <div className="mt-5">
          <h3 className="text-sm font-medium mb-2">Activity Streak</h3>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xl font-bold">{streakDays}</span>
                <span className="text-sm text-gray-500 ml-1">days</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {streakDays === 7 ? "Perfect streak!" : "Keep going!"}
              </div>
            </div>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 7 }).map((_, index) => (
                <div 
                  key={index} 
                  className={`h-2 flex-1 rounded-full ${
                    index < streakDays ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
