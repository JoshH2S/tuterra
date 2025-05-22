
import { PremiumCard } from "@/components/ui/premium-card";

export function WelcomePanel() {
  // Mock data
  const internshipTitle = "Marketing Analyst at NovaTech";
  const progressPercent = 33;
  const currentWeek = 3;
  const totalWeeks = 12;
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const nextDeadline = "May 26, 2025";
  
  return (
    <PremiumCard variant="elevated" className="overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">{internshipTitle}</h2>
        
        <div className="space-y-3">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Week {currentWeek} of {totalWeeks}</p>
          </div>
          
          {/* Date and next deadline */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
            <div className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300">{currentDate}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Next Deadline: {nextDeadline}
              </span>
            </div>
          </div>
          
          {/* AI message */}
          <div className="mt-4 bg-primary/10 rounded-lg p-4 border border-primary/20">
            <p className="text-sm">
              <span className="font-semibold">Welcome back, Alex!</span> You're making great progress on your marketing campaign analysis. Remember to review the latest consumer data before Friday's team meeting.
            </p>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
