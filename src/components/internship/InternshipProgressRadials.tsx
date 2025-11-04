"use client"

import { TrendingUp, Award } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useIsMobile } from "@/hooks/use-mobile"

interface InternshipProgressRadialsProps {
  completedTasks: number;
  totalTasks: number;
  averageScore: number;  // Average score out of 10
}

export function InternshipProgressRadials({ 
  completedTasks, 
  totalTasks, 
  averageScore 
}: InternshipProgressRadialsProps) {
  const isMobile = useIsMobile();
  
  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  // Format average score to display out of 10
  const formattedScore = averageScore ? 
    (Math.round(averageScore * 10) / 10).toFixed(1) : 
    "0.0";

  // Normalize average score to percentage for the chart (0-10 to 0-100)
  const scorePercentage = Math.round((averageScore / 10) * 100);
  
  // Task completion data
  const completionData = [
    { 
      name: "Task Completion", 
      value: completionPercentage,
      fill: "var(--color-completion)" 
    },
  ];
  
  // Average score data
  const scoreData = [
    { 
      name: "Average Score", 
      value: scorePercentage,
      fill: "var(--color-score)" 
    },
  ];
  
  const completionConfig = {
    completion: {
      label: "Completion",
      color: "var(--primary)",
    },
  } as ChartConfig;
  
  const scoreConfig = {
    score: {
      label: "Average Score",
      color: "#4F46E5", // Indigo color
    },
  } as ChartConfig;

  return (
    <div className={`grid grid-cols-2 ${isMobile ? 'gap-3' : 'gap-6'}`}>
      {/* Task Completion Radial */}
      <Card className="flex flex-col">
        <CardHeader className={`items-center ${isMobile ? 'pb-1 pt-3' : 'pb-2'}`}>
          <CardTitle className={isMobile ? 'text-sm font-medium' : 'text-lg'}>
            Task Completion
          </CardTitle>
        </CardHeader>
        <CardContent className={`flex-1 ${isMobile ? 'pb-1 px-2' : 'pb-2'}`}>
          <ChartContainer
            config={completionConfig}
            className={`mx-auto aspect-square ${isMobile ? 'h-[120px]' : 'h-[150px]'}`}
          >
            <RadialBarChart
              data={completionData}
              startAngle={90}
              endAngle={-270}
              innerRadius={isMobile ? 45 : 60}
              outerRadius={isMobile ? 60 : 80}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={isMobile ? [50, 40] : [65, 55]}
              />
              <RadialBar 
                dataKey="value" 
                background 
                cornerRadius={10} 
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className={`fill-foreground font-bold ${isMobile ? 'text-xl' : 'text-3xl'}`}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {completionPercentage}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + (isMobile ? 16 : 22)}
                            className={`fill-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}
                          >
                            {completedTasks}/{totalTasks} tasks
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        {!isMobile && (
          <CardFooter className="flex-col gap-1 text-sm pt-0">
            {completionPercentage > 0 && (
              <div className="flex items-center gap-1 text-xs leading-none text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span>Keep up the momentum!</span>
              </div>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Average Score Radial */}
      <Card className="flex flex-col">
        <CardHeader className={`items-center ${isMobile ? 'pb-1 pt-3' : 'pb-2'}`}>
          <CardTitle className={isMobile ? 'text-sm font-medium' : 'text-lg'}>
            Average Score
          </CardTitle>
        </CardHeader>
        <CardContent className={`flex-1 ${isMobile ? 'pb-1 px-2' : 'pb-2'}`}>
          <ChartContainer
            config={scoreConfig}
            className={`mx-auto aspect-square ${isMobile ? 'h-[120px]' : 'h-[150px]'}`}
          >
            <RadialBarChart
              data={scoreData}
              startAngle={90}
              endAngle={-270}
              innerRadius={isMobile ? 45 : 60}
              outerRadius={isMobile ? 60 : 80}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={isMobile ? [50, 40] : [65, 55]}
              />
              <RadialBar 
                dataKey="value" 
                background 
                cornerRadius={10} 
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className={`fill-foreground font-bold ${isMobile ? 'text-xl' : 'text-3xl'}`}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formattedScore}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + (isMobile ? 16 : 22)}
                            className={`fill-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}
                          >
                            out of 10
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        {!isMobile && (
          <CardFooter className="flex-col gap-1 text-sm pt-0">
            {averageScore > 0 && (
              <div className="flex items-center gap-1 text-xs leading-none text-muted-foreground">
                <Award className="h-3 w-3 text-indigo-500" />
                <span>{averageScore >= 8 ? "Excellent work!" : "Keep improving!"}</span>
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 