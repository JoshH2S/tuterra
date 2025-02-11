
import { useState, useEffect } from "react";
import { StudentPerformance, StudentCourse } from "@/types/student";

export interface AnalyticsInsight {
  type: 'improvement' | 'warning' | 'achievement';
  message: string;
  metric?: number;
  courseId?: string;
}

export const useStudentAnalytics = (courses: StudentCourse[], performance: StudentPerformance[]) => {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateInsights = () => {
      const newInsights: AnalyticsInsight[] = [];

      // Overall performance analysis
      const avgScore = performance.reduce((acc, curr) => acc + curr.average_score, 0) / performance.length;
      if (avgScore >= 85) {
        newInsights.push({
          type: 'achievement',
          message: '🌟 Outstanding overall performance across all courses!',
          metric: avgScore
        });
      } else if (avgScore < 60 && performance.length > 0) {
        newInsights.push({
          type: 'warning',
          message: '⚠️ Your overall performance needs attention. Consider scheduling study sessions.',
          metric: avgScore
        });
      }

      // Course-specific insights
      performance.forEach(p => {
        const course = courses.find(c => c.course_id === p.course_id);
        if (!course) return;

        // Progress tracking
        const completionRate = (p.completed_quizzes / p.total_quizzes) * 100;
        if (completionRate < 30) {
          newInsights.push({
            type: 'warning',
            message: `📚 Low quiz completion rate in ${course.course.title}. Try to complete more quizzes!`,
            courseId: p.course_id,
            metric: completionRate
          });
        }

        // Performance improvement needed
        if (p.average_score < 65) {
          newInsights.push({
            type: 'improvement',
            message: `📈 Room for improvement in ${course.course.title}. Consider reviewing past materials.`,
            courseId: p.course_id,
            metric: p.average_score
          });
        }

        // Achievement celebration
        if (p.average_score > 90) {
          newInsights.push({
            type: 'achievement',
            message: `🏆 Excellent performance in ${course.course.title}!`,
            courseId: p.course_id,
            metric: p.average_score
          });
        }
      });

      // Recent activity trends
      const activeCourses = courses.filter(c => c.status === 'active').length;
      if (activeCourses > 2) {
        newInsights.push({
          type: 'achievement',
          message: `🎯 You're actively engaged in ${activeCourses} courses - great time management!`
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
