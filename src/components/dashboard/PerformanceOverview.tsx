
import { StudentPerformance } from "@/types/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceOverviewProps {
  performance: StudentPerformance[];
}

export const PerformanceOverview = ({ performance }: PerformanceOverviewProps) => {
  const averageScore = performance.length > 0
    ? performance.reduce((acc, curr) => acc + curr.average_score, 0) / performance.length
    : 0;

  const totalQuizzes = performance.reduce((acc, curr) => acc + curr.completed_quizzes, 0);

  const chartData = performance.map(p => ({
    course: p.course_id,
    score: p.average_score,
  }));

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Overall Average</p>
            <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Quizzes Completed</p>
            <p className="text-2xl font-bold">{totalQuizzes}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active Courses</p>
            <p className="text-2xl font-bold">{performance.length}</p>
          </div>
        </div>
        
        {chartData.length > 0 && (
          <div className="h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="course" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
