
import { FC, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { StudentPerformance } from "@/types/student";
import { motion } from "framer-motion";
import { BarChartIcon, BookOpenIcon, CheckCircleIcon, TrendingUpIcon } from "lucide-react";

// Define chart config
const chartConfig = {
  courseBar: {
    theme: {
      light: "#3b82f6", // Blue
      dark: "#60a5fa",
    },
  },
};

interface CoursePerformanceCardProps {
  performance: StudentPerformance[];
}

export const CoursePerformanceCard: FC<CoursePerformanceCardProps> = ({ performance }) => {
  // Calculate overall stats from performance data
  const stats = useMemo(() => {
    const totalCourses = performance.length;
    
    // Get average score across all courses
    let avgScore = 0;
    let completionRate = 0;
    let activeCourses = 0;
    
    if (totalCourses > 0) {
      // Calculate average score
      avgScore = Math.round(
        performance.reduce((acc, curr) => acc + curr.average_score, 0) / totalCourses
      );
      
      // Calculate completion rate
      const totalCompleted = performance.reduce(
        (acc, curr) => acc + curr.completed_quizzes, 
        0
      );
      
      const totalQuizzes = performance.reduce(
        (acc, curr) => acc + curr.total_quizzes, 
        0
      );
      
      completionRate = totalQuizzes > 0 
        ? Math.round((totalCompleted / totalQuizzes) * 100) 
        : 0;
      
      // Count active courses
      activeCourses = performance.length;
    }
    
    return { avgScore, completionRate, activeCourses };
  }, [performance]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    return {
      labels: performance.map(p => p.course_title || "Unnamed Course"),
      datasets: [
        {
          label: "Average Score",
          data: performance.map(p => p.average_score),
          backgroundColor: "#3b82f6",
          borderRadius: 6,
          maxBarThickness: 40,
          borderSkipped: false,
        },
      ],
    };
  }, [performance]);
  
  // Animation variants for motion components
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <BarChartIcon className="mr-2 h-5 w-5 text-blue-500" />
          Course Performance
        </h3>
        
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Average Score Card */}
          <motion.div
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 p-4 rounded-lg"
            variants={itemVariants}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
              </div>
              <div className="bg-blue-500/10 p-2 rounded-full">
                <TrendingUpIcon className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </motion.div>
          
          {/* Completion Rate Card */}
          <motion.div
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40 p-4 rounded-lg"
            variants={itemVariants}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <div className="bg-green-500/10 p-2 rounded-full">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </motion.div>
          
          {/* Active Courses Card */}
          <motion.div
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 p-4 rounded-lg"
            variants={itemVariants}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Courses</p>
                <p className="text-2xl font-bold">{stats.activeCourses}</p>
              </div>
              <div className="bg-purple-500/10 p-2 rounded-full">
                <BookOpenIcon className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Chart */}
        {performance.length > 0 ? (
          <motion.div 
            className="h-[300px] mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ChartContainer config={chartConfig}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "hsl(var(--card))",
                      padding: 12,
                      titleFont: {
                        size: 14,
                      },
                      bodyFont: {
                        size: 13,
                      },
                      cornerRadius: 4,
                      displayColors: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: (value) => `${value}%`,
                      },
                    },
                  },
                  animation: {
                    duration: 1000,
                    // Fix: Use a specific easing function from Chart.js allowed values
                    easing: 'easeOutQuart',
                  },
                }}
              />
            </ChartContainer>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-[300px] bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No performance data available</p>
          </div>
        )}
      </div>
    </Card>
  );
};
