import { ActivityStreakDisplay } from "@/components/internship/ActivityStreakDisplay";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export function ActivityDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ActivityStreakDisplay />
      <UpcomingEvents />
    </div>
  );
} 