
import { StudentPerformance } from "@/types/student";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertTriangle, BarChart as BarChartIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PremiumCard, PremiumContentCard, PremiumStatsCard } from "@/components/ui/premium-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

interface PerformanceOverviewProps {
  performance: StudentPerformance[];
}

export const PerformanceOverview = ({ performance }: PerformanceOverviewProps) => {
  const isMobile = useIsMobile();
  
  // Data validation
  if (!Array.isArray(performance)) {
    return <div>Invalid performance data</div>;
  }

  if (performance.some(p => typeof p.average_score !== 'number')) {
    return <div>Invalid performance data: Average score must be a number</div>;
  }
  
  // Calculate the weighted average score based on completed quizzes with null check
  const totalCompletedQuizzes = performance.reduce((acc, curr) => acc + (curr.completed_quizzes || 0), 0);
  const averageScore = totalCompletedQuizzes > 0
    ? performance.reduce((acc, curr) => acc + ((curr.average_score || 0) * (curr.completed_quizzes || 0)), 0) / totalCompletedQuizzes
    : 0;

  const totalQuizzes = performance.reduce((acc, curr) => acc + (curr.completed_quizzes || 0), 0);
  
  // Improved error handling for completion rate
  const totalCompletionRate = performance.length > 0
    ? (performance.reduce((acc, curr) => {
        const rate = (curr.total_quizzes || 0) > 0 
          ? (((curr.completed_quizzes || 0) / (curr.total_quizzes || 1)) * 100)
          : 0;
        return acc + rate;
      }, 0) / performance.length)
    : 0;

  // Proper null checks for course titles
  const chartData = performance.map(p => ({
    course: p.course_title || p.courses?.title || 'Unnamed Course',
    score: p.average_score || 0,
    quizzes: p.completed_quizzes || 0,
  }));

  const chartConfig: ChartConfig = {
    score: {
      label: "Average Score",
      color: "#3b82f6",
    }
  };

  return (
    <div className="grid gap-6">
      <PremiumContentCard 
        title="Performance Overview" 
        variant="gradient"
      >
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <PremiumStatsCard
            title="Overall Average"
            value={`${averageScore.toFixed(1)}%`}
            trend={averageScore > 75 ? "up" : averageScore > 50 ? "neutral" : "down"}
            trendValue={averageScore > 75 ? "Excellent" : averageScore > 50 ? "Good" : "Needs improvement"}
            className="border-l-4 border-l-blue-500"
          />
          
          <PremiumStatsCard
            title="Quizzes Completed"
            value={totalQuizzes}
            className="border-l-4 border-l-green-500"
          />
          
          <PremiumStatsCard
            title="Completion Rate"
            value={`${totalCompletionRate.toFixed(1)}%`}
            trend={totalCompletionRate > 75 ? "up" : totalCompletionRate > 50 ? "neutral" : "down"}
            trendValue={`${totalCompletionRate > 75 ? "On track" : totalCompletionRate > 50 ? "Making progress" : "Behind schedule"}`}
            className="border-l-4 border-l-purple-500"
          />
        </div>
          
        {chartData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChartIcon className="mr-2 h-5 w-5 text-blue-500" />
              Course Performance
            </h3>
            <PremiumCard variant="minimal" className="p-4">
              <div className="h-[250px] bg-transparent rounded-lg">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <BarChart 
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                    barSize={36}
                  >
                    <defs>
                      <linearGradient id="performanceGradient" x1="0" y1="0" x2="1" y2="0">
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
                          labelClassName="font-bold"
                        />
                      }
                    />
                    <Bar 
                      dataKey="score" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                      name="Average Score"
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </PremiumCard>
          </div>
        )}
      </PremiumContentCard>

      {performance.map((p, index) => {
        if (!p.total_quizzes) return null;
        
        const completionRate = ((p.completed_quizzes || 0) / p.total_quizzes) * 100;
        let alert;

        if (completionRate < 50) {
          alert = (
            <Alert key={index} className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-600">
                Try to complete more quizzes to improve your understanding.
              </AlertDescription>
            </Alert>
          );
        }

        return alert;
      })}
    </div>
  );
};
