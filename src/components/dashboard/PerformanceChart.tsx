
import { Card } from "@/components/ui/card";
import { StudentPerformance } from "@/types/student";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as BarChartIcon } from "lucide-react";

interface PerformanceChartProps {
  performance: StudentPerformance[];
}

export function PerformanceChart({ performance }: PerformanceChartProps) {
  const chartData = performance.map(p => ({
    course: p.course_title || 'Unnamed Course',
    score: p.average_score,
    quizzes: p.completed_quizzes,
  }));

  return (
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
  );
}
