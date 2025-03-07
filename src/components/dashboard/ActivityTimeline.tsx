
import { motion } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { Activity, Book, Calendar, Clock, Edit, GraduationCap } from "lucide-react";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";

// Define the activity types
type ActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ElementType;
  type: 'session' | 'quiz' | 'course';
  metadata?: Record<string, any>;
};

interface ActivityTimelineProps {
  sessions?: StudySession[];
  courses?: StudentCourse[];
  maxItems?: number;
}

export function ActivityTimeline({ sessions = [], courses = [], maxItems = 5 }: ActivityTimelineProps) {
  // Create activity items from study sessions
  const sessionActivities: ActivityItem[] = sessions.map(session => {
    const course = courses.find(c => c.course_id === session.course_id);
    const startTime = new Date(session.start_time);
    
    return {
      id: session.id,
      title: `Study session: ${session.title}`,
      description: session.description || (course ? `For course: ${course.course.title}` : 'No description'),
      timestamp: startTime,
      icon: Book,
      type: 'session',
      metadata: {
        sessionId: session.id,
        courseId: session.course_id,
        courseName: course?.course.title,
        startTime: session.start_time,
        endTime: session.end_time
      }
    };
  });

  // Sort activities by timestamp (newest first)
  const sortedActivities = [...sessionActivities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Limit the number of activities displayed
  const displayedActivities = sortedActivities.slice(0, maxItems);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
      </CardHeader>

      <div className="relative px-6 pb-6">
        {displayedActivities.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No recent activity to display</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
            
            <div className="space-y-6">
              {displayedActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-10"
                >
                  <div className="absolute left-0 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <activity.icon className="w-4 h-4 text-primary" />
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(activity.timestamp, 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(activity.timestamp, 'HH:mm')}
                      </div>
                      {activity.metadata?.courseName && (
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {activity.metadata.courseName}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(activity.timestamp)} ago
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
