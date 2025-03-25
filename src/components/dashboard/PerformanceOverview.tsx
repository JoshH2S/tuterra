
import { StudentPerformance } from "@/types/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, BarChart as BarChartIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PerformanceOverviewProps {
  performance: StudentPerformance[];
}

export const PerformanceOverview = ({ performance }: PerformanceOverviewProps) => {
  // Calculate the weighted average score based on completed quizzes
  const totalCompletedQuizzes = performance.reduce((acc, curr) => acc + curr.completed_quizzes, 0);
  const averageScore = totalCompletedQuizzes > 0
    ? performance.reduce((acc, curr) => acc + (curr.average_score * curr.completed_quizzes), 0) / totalCompletedQuizzes
    : 0;

  const totalQuizzes = performance.reduce((acc, curr) => acc + curr.completed_quizzes, 0);
  const totalCompletionRate = performance.length > 0
    ? (performance.reduce((acc, curr) => acc + ((curr.completed_quizzes / curr.total_quizzes) * 100), 0) / performance.length)
    : 0;

  const chartData = performance.map(p => ({
    course: p.course_title || 'Unnamed Course',
    score: p.average_score,
    quizzes: p.completed_quizzes,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
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
        </div>
          
        {chartData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChartIcon className="mr-2 h-5 w-5 text-blue-500" />
              Course Performance
            </h3>
            <div className="h-[250px] bg-card rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                  barSize={36}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
