
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Book, CheckCircle } from "lucide-react";
import { StudentPerformance } from "@/types/student";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, trend, color, delay }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border ${color} hover:shadow-md transition-all`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-full ${color.replace('border-l-4', 'bg-opacity-20 bg')}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-3">
          <span className={`mr-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
            {trend === 'up' ? <TrendingUp size={16} /> : trend === 'down' ? <TrendingDown size={16} /> : null}
          </span>
          <span className={`text-xs ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
            {trend === 'up' ? 'Improving' : trend === 'down' ? 'Needs attention' : 'Stable'}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export function CoursePerformanceCard({ performance }: { performance: StudentPerformance[] }) {
  const isMobile = useIsMobile();
  const [chartData, setChartData] = useState<any>(null);
  
  const stats = useMemo(() => {
    if (!performance.length) return null;
    
    const avgScore = performance.reduce((acc, curr) => acc + curr.average_score, 0) / performance.length;
    
    const completedQuizzes = performance.reduce((acc, curr) => acc + curr.completed_quizzes, 0);
    const totalQuizzes = performance.reduce((acc, curr) => acc + curr.total_quizzes, 0);
    const completionRate = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;
    
    const activeCourses = performance.length;
    
    return {
      averageScore: Math.round(avgScore),
      completionRate: Math.round(completionRate),
      activeCourses
    };
  }, [performance]);

  useEffect(() => {
    if (!performance.length) return;

    const labels = performance.map(item => {
      return item.course_title || `Course ${item.course_id.substring(0, 4)}`;
    });

    const data = performance.map(item => item.average_score);
    
    setChartData(performance.map(item => ({
      course: item.course_title || `Course ${item.course_id.substring(0, 4)}`,
      score: item.average_score
    })));
  }, [performance]);

  if (!stats || !chartData) {
    return (
      <Card className="w-full p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </Card>
    );
  }

  const chartConfig: ChartConfig = {
    score: {
      label: "Average Score",
      color: "url(#performanceGradient)"
    }
  };

  return (
    <Card className="w-full p-4 md:p-6">
      <h3 className="text-lg md:text-xl font-semibold mb-4">Course Performance</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Average Score" 
          value={`${stats.averageScore}%`} 
          icon={<TrendingUp size={isMobile ? 16 : 20} className="text-blue-500" />}
          trend={stats.averageScore >= 70 ? "up" : stats.averageScore >= 50 ? "neutral" : "down"}
          color="border-l-4 border-blue-500"
          delay={1}
        />
        
        <StatCard 
          title="Completion Rate" 
          value={`${stats.completionRate}%`} 
          icon={<CheckCircle size={isMobile ? 16 : 20} className="text-green-500" />}
          trend={stats.completionRate >= 70 ? "up" : stats.completionRate >= 50 ? "neutral" : "down"}
          color="border-l-4 border-green-500"
          delay={2}
        />
        
        <StatCard 
          title="Active Courses" 
          value={stats.activeCourses} 
          icon={<Book size={isMobile ? 16 : 20} className="text-purple-500" />}
          color="border-l-4 border-purple-500"
          delay={3}
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="h-64 md:h-80"
      >
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart 
            data={chartData}
            margin={{ 
              top: 10, 
              right: 10, 
              left: 10, 
              bottom: isMobile ? 60 : 30 
            }}
            barSize={40}
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
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 80 : 40}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
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
              fill="url(#performanceGradient)" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              name="Average Score"
            />
          </BarChart>
        </ChartContainer>
      </motion.div>
    </Card>
  );
}
