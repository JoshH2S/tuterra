
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopicData {
  topic: string;
  correct: number;
  total: number;
  percentage: number;
}

interface TopicPerformanceProps {
  topics: TopicData[];
}

export function TopicPerformance({ topics }: TopicPerformanceProps) {
  if (topics.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4 text-[#091747]">Topic Performance</h2>
        <div className="space-y-4">
          {topics.map((topic, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{topic.topic}</span>
                <span className="text-sm text-muted-foreground">
                  {topic.correct}/{topic.total} ({topic.percentage.toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={topic.percentage} 
                className="h-2 [&::-webkit-progress-bar]:bg-[hsl(45,70%,98%)] [&::-webkit-progress-value]:bg-[#B8860B]"
                indicatorClassName="bg-[#B8860B]"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
