
import { StudentPerformance } from "@/types/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertTriangle, TrendingUp, Trophy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PerformanceOverviewProps {
  performance: StudentPerformance[];
}

export const PerformanceOverview = ({ performance }: PerformanceOverviewProps) => {
  const averageScore = performance.length > 0
    ? performance.reduce((acc, curr) => acc + curr.average_score, 0) / performance.length
    : 0;

  const totalQuizzes = performance.reduce((acc, curr) => acc + curr.completed_quizzes, 0);
  const totalCompletionRate = performance.length > 0
    ? (performance.reduce((acc, curr) => acc + (curr.completed_quizzes / curr.total_quizzes), 0) / performance.length) * 100
    : 0;

  const chartData = performance.map(p => ({
    course: p.course_id,
    score: p.average_score,
    quizzes: p.completed_quizzes,
  }));

  const quizCompletionData = performance.map(p => ({
    course: p.course_id,
    completed: p.completed_quizzes,
    total: p.total_quizzes,
    completion: (p.completed_quizzes / p.total_quizzes) * 100,
  }));

  return (
    <div className="grid gap-6">
      <Card className="col-span-full">
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
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
                <div className="h-[250px] bg-card rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="course" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={{ fill: '#2563eb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Quiz Completion Progress</h3>
                <div className="h-[250px] bg-card rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quizCompletionData}>
                      <XAxis dataKey="course" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar 
                        dataKey="completion" 
                        fill="#2563eb" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {performance.map((p, index) => {
        const completionRate = (p.completed_quizzes / p.total_quizzes) * 100;
        let alert;

        if (p.average_score >= 85) {
          alert = (
            <Alert key={index} className="bg-green-50 border-green-200">
              <Trophy className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Excellent performance! Keep up the great work in this course.
              </AlertDescription>
            </Alert>
          );
        } else if (completionRate < 50) {
          alert = (
            <Alert key={index} className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-600">
                Try to complete more quizzes to improve your understanding.
              </AlertDescription>
            </Alert>
          );
        } else if (p.average_score < 70) {
          alert = (
            <Alert key={index} className="bg-blue-50 border-blue-200">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-600">
                You're making progress! Keep practicing to improve your score.
              </AlertDescription>
            </Alert>
          );
        }

        return alert;
      })}
    </div>
  );
};
