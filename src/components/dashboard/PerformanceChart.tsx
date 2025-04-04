
import { Card } from "@/components/ui/card";
import { StudentPerformance } from "@/types/student";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart as BarChartIcon } from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";

interface PerformanceChartProps {
  performance: StudentPerformance[];
}

export function PerformanceChart({ performance }: PerformanceChartProps) {
  const chartData = performance.map(p => ({
    course: p.course_title || 'Unnamed Course',
    score: p.average_score,
    quizzes: p.completed_quizzes,
  }));

  const chartConfig: ChartConfig = {
    score: {
      label: "Average Score",
      color: "url(#scoreGradient)",
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BarChartIcon className="mr-2 h-5 w-5 text-blue-500" />
        Course Performance
      </h3>
      
      {chartData.length > 0 ? (
        <div className="h-[300px] bg-card rounded-lg">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart 
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
              barSize={40}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#091747" />
                  <stop offset="100%" stopColor="var(--chart-gradient-end)" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="course" 
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                label={{ 
                  value: 'Score (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }} 
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [`${value}%`, 'Average Score']}
                  />
                }
              />
              <Bar 
                dataKey="score" 
                fill="url(#scoreGradient)" 
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                name="Average Score"
              />
            </BarChart>
          </ChartContainer>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No performance data available
        </div>
      )}
    </Card>
  );
}
