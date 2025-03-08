
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicPerformanceCardProps {
  topics: Record<string, { correct: number; total: number }>;
}

export function TopicPerformanceCard({ topics }: TopicPerformanceCardProps) {
  // Convert topics to array and sort by performance (worst to best)
  const topicsArray = Object.entries(topics || {})
    .map(([topic, data]) => ({
      topic,
      correct: data.correct,
      total: data.total,
      percentage: data.total > 0 ? (data.correct / data.total) * 100 : 0
    }))
    .sort((a, b) => a.percentage - b.percentage);

  if (topicsArray.length === 0) return null;

  // Function to determine progress bar color based on score
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Topic Performance</h2>
      </div>
      
      <div className="space-y-6">
        {topicsArray.map((topic, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">{topic.topic}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {topic.correct}/{topic.total} ({topic.percentage.toFixed(0)}%)
              </span>
            </div>
            <Progress 
              value={topic.percentage} 
              className="h-2"
              indicatorClassName={getProgressColor(topic.percentage)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
