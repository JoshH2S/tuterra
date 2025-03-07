import React from "react";
import { Card } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Sample data for the charts
const performanceData = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 59 },
  { month: "Mar", score: 80 },
  { month: "Apr", score: 81 },
  { month: "May", score: 76 },
  { month: "Jun", score: 85 },
];

const subjectData = [
  { name: "Math", value: 85 },
  { name: "Science", value: 70 },
  { name: "History", value: 65 },
  { name: "English", value: 90 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

/**
 * InteractiveChart component for desktop
 * - Complex chart with full interactive features
 * - Multiple data visualization options
 */
export function InteractiveChart() {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={performanceData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "6px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              border: "none",
            }}
            labelStyle={{ fontWeight: "bold" }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorScore)"
            activeDot={{ r: 8 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * SimpleChart component for mobile
 * - Streamlined chart with touch-friendly elements
 * - Optimized for smaller screens
 */
export function SimpleChart() {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={performanceData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barSize={20}
        >
          <XAxis 
            dataKey="month" 
            scale="point" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
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
          />
          <Bar 
            dataKey="score" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Subject Distribution chart - alternative visualization
 */
export function SubjectDistributionChart({ simple = false }: { simple?: boolean }) {
  return (
    <div className={`${simple ? "h-[200px]" : "h-[300px]"} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={subjectData}
            cx="50%"
            cy="50%"
            labelLine={!simple}
            outerRadius={simple ? 60 : 80}
            fill="#8884d8"
            dataKey="value"
            label={!simple ? ({ name, value }) => `${name}: ${value}%` : false}
          >
            {subjectData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "6px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              border: "none",
            }}
          />
          {!simple && <Legend layout="horizontal" verticalAlign="bottom" align="center" />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * AdaptiveChart component
 * - Renders different chart types based on screen size
 * - Optimized for both desktop and mobile experiences
 */
export function AdaptiveChart() {
  const { isDesktop } = useResponsive();
  
  return (
    <Card className={cn("w-full", isDesktop ? "p-6" : "p-4")}>
      <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
      {isDesktop ? (
        // Complex interactive chart for desktop
        <InteractiveChart />
      ) : (
        // Simplified chart for mobile
        <SimpleChart />
      )}
    </Card>
  );
}

/**
 * AdaptiveSubjectChart component
 * - Renders subject distribution with appropriate complexity
 */
export function AdaptiveSubjectChart() {
  const { isDesktop } = useResponsive();
  
  return (
    <Card className={cn("w-full", isDesktop ? "p-6" : "p-4")}>
      <h3 className="text-lg font-semibold mb-4">Subject Distribution</h3>
      <SubjectDistributionChart simple={!isDesktop} />
    </Card>
  );
}

export default AdaptiveChart;
