
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
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent,
  ChartConfig 
} from "@/components/ui/chart";

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
  const chartConfig: ChartConfig = {
    score: {
      label: "Performance Score",
      color: "#091747"
    }
  };

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <AreaChart
          data={performanceData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#091747" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--chart-gradient-end)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [`${value}`, 'Performance Score']}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#091747"
            fillOpacity={1}
            fill="url(#colorScore)"
            activeDot={{ r: 8 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

/**
 * SimpleChart component for mobile
 * - Streamlined chart with touch-friendly elements
 * - Optimized for smaller screens
 */
export function SimpleChart() {
  const chartConfig: ChartConfig = {
    score: {
      label: "Performance Score",
      color: "url(#mobileScoreGradient)"
    }
  };

  return (
    <div className="h-[250px] w-full">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <BarChart
          data={performanceData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barSize={20}
        >
          <defs>
            <linearGradient id="mobileScoreGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#091747" />
              <stop offset="100%" stopColor="var(--chart-gradient-end)" />
            </linearGradient>
          </defs>
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
          <ChartTooltip
            content={
              <ChartTooltipContent 
                formatter={(value, name) => [`${value}`, 'Performance Score']}
              />
            }
          />
          <Bar 
            dataKey="score" 
            fill="url(#mobileScoreGradient)" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

/**
 * Subject Distribution chart - alternative visualization
 */
export function SubjectDistributionChart({ simple = false }: { simple?: boolean }) {
  const chartConfig: ChartConfig = {
    value: {
      label: "Subject Score",
      color: "#8884d8"
    }
  };

  return (
    <div className={`${simple ? "h-[200px]" : "h-[300px]"} w-full`}>
      <ChartContainer config={chartConfig} className="w-full h-full">
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
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [`${value}%`, name]}
              />
            }
          />
          {!simple && <ChartLegend content={<ChartLegendContent />} layout="horizontal" verticalAlign="bottom" align="center" />}
        </PieChart>
      </ChartContainer>
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
