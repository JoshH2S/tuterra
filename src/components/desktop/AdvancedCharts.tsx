
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

  return (
    <Card className="p-6 hidden lg:block">
      <h3 className="text-lg font-semibold mb-6">Performance Trend</h3>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={mockPerformanceData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "6px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "none",
              }}
              labelStyle={{ fontWeight: "bold" }}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
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
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={10}
            />
          </AreaChart>
        </ResponsiveContainer>
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

  return (
    <Card className="p-6 mt-6 hidden lg:block">
      <h3 className="text-lg font-semibold mb-6">Skill Analytics</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mockAnalyticsData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            barSize={35}
            barGap={10}
          >
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
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "6px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "none",
              }}
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={10}
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar
              dataKey="target"
              name="Target"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
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
