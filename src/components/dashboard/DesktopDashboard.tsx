
import { Card } from "@/components/ui/card";
import { StudentPerformance } from "@/types/student";
import { StudySession } from "@/hooks/useStudySessions";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, BarChart as BarChartIcon, TrendingUp } from "lucide-react";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { TasksList } from "@/components/dashboard/TasksList";
import { StrengthsAndAreas } from "@/components/dashboard/StrengthsAndAreas";
import { StudentCourse } from "@/types/student";

interface DesktopDashboardProps {
  performance: StudentPerformance[];
  insights: Array<{
    type: 'warning' | 'achievement' | 'improvement';
    message: string;
    metric?: number;
  }>;
  sessions: StudySession[];
  courses: StudentCourse[];
  createSession: (sessionData: Omit<StudySession, 'id' | 'student_id'>) => Promise<void>;
  children?: React.ReactNode;
}

export function DesktopDashboard({ 
  performance, 
  insights, 
  sessions, 
  courses,
  createSession,
  children 
}: DesktopDashboardProps) {
  // Calculate the weighted average score based on completed quizzes
  const totalCompletedQuizzes = performance.reduce((acc, curr) => acc + curr.completed_quizzes, 0);
  const averageScore = totalCompletedQuizzes > 0
    ? performance.reduce((acc, curr) => acc + (curr.average_score * curr.completed_quizzes), 0) / totalCompletedQuizzes
    : 0;

  const totalQuizzes = performance.reduce((acc, curr) => acc + curr.completed_quizzes, 0);
  const totalCompletionRate = performance.length > 0
    ? (performance.reduce((acc, curr) => acc + ((curr.completed_quizzes / curr.total_quizzes) * 100), 0) / performance.length)
    : 0;

  // Collect all strengths and areas for improvement across all courses
  const allStrengths = performance.flatMap(p => p.strengths || []);
  const allAreasForImprovement = performance.flatMap(p => p.areas_for_improvement || []);
  
  // Remove duplicates
  const uniqueStrengths = [...new Set(allStrengths)];
  const uniqueAreasForImprovement = [...new Set(allAreasForImprovement)];

  const chartData = performance.map(p => ({
    course: p.course_title || 'Unnamed Course',
    score: p.average_score,
    quizzes: p.completed_quizzes,
  }));

  // Create a function to handle opening the study session dialog
  const handleOpenSessionDialog = () => {
    // This will be implemented in the TasksList component
  };

  return (
    <div className="space-y-8">
      {/* News Feed at the top */}
      {children}

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Overall Average</p>
            <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Quizzes Completed</p>
            <p className="text-2xl font-bold">{totalQuizzes}</p>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">{totalCompletionRate.toFixed(1)}%</p>
          </div>
        </Card>
      </section>

      {/* Activity & Tasks Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline sessions={sessions} courses={courses} />
        <TasksList 
          sessions={sessions} 
          courses={courses} 
          onCreateSession={() => {
            // This will need to trigger the same dialog as in StudyCalendar
            // For now we'll leave this empty
          }}
        />
      </section>

      {/* Insights Section */}
      {insights.length > 0 && (
        <section className="grid grid-cols-1 gap-3">
          {insights.map((insight, index) => {
            const Icon = insight.type === 'warning' 
              ? AlertTriangle 
              : insight.type === 'achievement' 
                ? TrendingUp 
                : TrendingUp;

            const bgColor = insight.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200'
              : insight.type === 'achievement'
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200';

            const textColor = insight.type === 'warning'
              ? 'text-yellow-600'
              : insight.type === 'achievement'
                ? 'text-green-600'
                : 'text-blue-600';

            return (
              <Card key={index} className={`${bgColor} p-4`}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${textColor} mt-0.5`} />
                  <div className={textColor}>
                    <p className="font-medium">{insight.message}</p>
                    {insight.metric && (
                      <p className="text-sm">{insight.metric.toFixed(1)}{insight.type === 'improvement' ? '%' : ''}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {/* Performance Chart */}
      <section className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChartIcon className="mr-2 h-5 w-5 text-blue-500" />
            Course Performance
          </h3>
          
          {chartData.length > 0 ? (
            <div className="h-[300px] bg-card rounded-lg">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                  barSize={40}
                >
                  <XAxis 
                    dataKey="course" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    label={{ 
                      value: 'Score (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }} 
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Average Score']}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                    name="Average Score"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No performance data available
            </div>
          )}
        </Card>
      </section>

      {/* Strengths and Areas */}
      {(uniqueStrengths.length > 0 || uniqueAreasForImprovement.length > 0) && (
        <section>
          <StrengthsAndAreas 
            strengths={uniqueStrengths} 
            areasForImprovement={uniqueAreasForImprovement} 
          />
        </section>
      )}
    </div>
  );
}
