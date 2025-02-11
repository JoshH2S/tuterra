
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StudentPerformance, StudentCourse } from "@/types/student";
import { toast } from "@/hooks/use-toast";

export interface AnalyticsInsight {
  type: 'improvement' | 'warning' | 'achievement';
  message: string;
  metric?: number;
}

export const useStudentAnalytics = (courses: StudentCourse[], performance: StudentPerformance[]) => {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateInsights = () => {
      const newInsights: AnalyticsInsight[] = [];

      // Average score trends
      const avgScore = performance.reduce((acc, curr) => acc + curr.average_score, 0) / performance.length;
      if (avgScore >= 85) {
        newInsights.push({
          type: 'achievement',
          message: 'Excellent overall performance! Keep up the great work!',
          metric: avgScore
        });
      } else if (avgScore < 60) {
        newInsights.push({
          type: 'warning',
          message: 'Your overall performance might need some attention.',
          metric: avgScore
        });
      }

      // Course completion progress
      const activeCourses = courses.filter(c => c.status === 'active').length;
      const completedCourses = courses.filter(c => c.status === 'completed').length;
      if (completedCourses > 0) {
        newInsights.push({
          type: 'achievement',
          message: `You've completed ${completedCourses} course${completedCourses > 1 ? 's' : ''}!`,
          metric: completedCourses
        });
      }

      // Quiz completion trends
      const totalQuizzesTaken = performance.reduce((acc, curr) => acc + curr.completed_quizzes, 0);
      if (totalQuizzesTaken > 0) {
        newInsights.push({
          type: 'improvement',
          message: `You've completed ${totalQuizzesTaken} quizzes across all courses`,
          metric: totalQuizzesTaken
        });
      }

      setInsights(newInsights);
      setIsLoading(false);
    };

    if (courses.length > 0 || performance.length > 0) {
      generateInsights();
    } else {
      setIsLoading(false);
    }
  }, [courses, performance]);

  return { insights, isLoading };
};
