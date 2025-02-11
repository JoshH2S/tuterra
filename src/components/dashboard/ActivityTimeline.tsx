
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { StudySession } from "@/hooks/useStudySessions";

interface ActivityLog {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
  metadata: {
    session?: StudySession;
  } | null;
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Activity</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Recent Activity</h2>
      {activities.length === 0 ? (
        <p className="text-muted-foreground">No recent activity to display.</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="mt-1">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium">{activity.description}</p>
                {activity.metadata?.session && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(activity.metadata.session.start_time), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(activity.metadata.session.start_time), 'HH:mm')} - 
                        {format(new Date(activity.metadata.session.end_time), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
