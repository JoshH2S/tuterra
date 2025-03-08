
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopicData {
  topic: string;
  correct: number;
  total: number;
}

interface TopicPerformanceProps {
  topics: Array<TopicData> | Record<string, { correct: number; total: number }>;
}

export function TopicPerformance({ topics }: TopicPerformanceProps) {
  // Convert topics to array format if it's an object
  const topicsArray = Array.isArray(topics) 
    ? topics 
    : Object.entries(topics || {}).map(([topic, data]) => ({
        topic,
        correct: data.correct,
        total: data.total
      }));

  if (topicsArray.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4 text-[#091747]">Topic Performance</h2>
        <div className="space-y-4">
          {topicsArray.map((topic, index) => {
            // Safely calculate percentage
            const percentage = topic.total > 0 
              ? (topic.correct / topic.total) * 100 
              : 0;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{topic.topic}</span>
                  <span className="text-sm text-muted-foreground">
                    {topic.correct}/{topic.total} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                  indicatorClassName="bg-[#B8860B]"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
