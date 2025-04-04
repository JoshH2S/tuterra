
import React from "react";
import { Card } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent,
  ChartConfig 
} from "@/components/ui/chart";

const mockPerformanceData = [
  { month: "Jan", score: 65, average: 55 },
  { month: "Feb", score: 59, average: 56 },
  { month: "Mar", score: 80, average: 58 },
  { month: "Apr", score: 81, average: 60 },
  { month: "May", score: 76, average: 63 },
  { month: "Jun", score: 85, average: 65 },
  { month: "Jul", score: 90, average: 68 },
];

const mockAnalyticsData = [
  { category: "Reading", completed: 85, target: 100 },
  { category: "Writing", completed: 75, target: 80 },
  { category: "Analysis", completed: 92, target: 90 },
  { category: "Research", completed: 60, target: 70 },
  { category: "Problem Solving", completed: 88, target: 85 },
];

/**
 * Enhanced Performance Chart - Desktop Only
 * Complex chart component with interactive elements optimized for desktop
 */
export function EnhancedPerformanceChart() {
  const { isDesktop } = useResponsive();

  if (isDesktop === false) return null;

  const chartConfig: ChartConfig = {
    score: {
      label: "Your Score",
      color: "#091747"
    },
    average: {
      label: "Class Average",
      color: "#6366f1"
    }
  };

  return (
    <Card className="p-6 hidden lg:block">
      <h3 className="text-lg font-semibold mb-6">Performance Trend</h3>
      <div className="h-[350px] w-full">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <AreaChart
            data={mockPerformanceData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#091747" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-gradient-end)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelStyle={{ fontWeight: "bold" }}
                  cursor={{ strokeDasharray: "3 3" }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#091747"
              fillOpacity={1}
              fill="url(#scoreGradient)"
              activeDot={{
                r: 6,
                strokeWidth: 2,
                stroke: "#fff",
                className: "hover:r-8 transition-all duration-300",
              }}
              name="Your Score"
            />
            <Area
              type="monotone"
              dataKey="average"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#avgGradient)"
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              name="Class Average"
            />
            <ChartLegend
              content={<ChartLegendContent />}
              verticalAlign="top"
              height={36}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </Card>
  );
}

/**
 * Detailed Analytics Chart - Desktop Only
 * Complex chart implementation with hover interactions
 */
export function DetailedAnalyticsChart() {
  const { isDesktop } = useResponsive();

  if (isDesktop === false) return null;

  const chartConfig: ChartConfig = {
    completed: {
      label: "Completed",
      color: "url(#completedGradient)"
    },
    target: {
      label: "Target",
      color: "url(#targetGradient)"
    }
  };

  return (
    <Card className="p-6 mt-6 hidden lg:block">
      <h3 className="text-lg font-semibold mb-6">Skill Analytics</h3>
      <div className="h-[300px] w-full">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart
            data={mockAnalyticsData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            barSize={35}
            barGap={10}
          >
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#091747" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="targetGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#091747" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent />}
              verticalAlign="top"
              height={36}
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="url(#completedGradient)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar
              dataKey="target"
              name="Target"
              fill="url(#targetGradient)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}

/**
 * Combined Advanced Charts component - Desktop Only
 * Only renders on desktop screens for better performance
 */
export function AdvancedCharts() {
  const { isDesktop } = useResponsive();

  if (isDesktop === false) return null;

  return (
    <div className="hidden lg:block space-y-6">
      <EnhancedPerformanceChart />
      <DetailedAnalyticsChart />
    </div>
  );
}

export default AdvancedCharts;
