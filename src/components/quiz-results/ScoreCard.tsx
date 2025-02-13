
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  percentageScore: number;
  getPerformanceMessage: (score: number) => string;
}

export function ScoreCard({ percentageScore, getPerformanceMessage }: ScoreCardProps) {
  return (
    <Card className="bg-primary text-white p-6">
      <CardContent className="space-y-4 pt-6">
        <div className="relative w-full aspect-square flex items-center justify-center">
          <div className="absolute inset 0">
            <Progress 
              value={percentageScore} 
              className="h-full w-full rounded-full border-4 border-blue-500/20 bg-transparent"
            />
          </div>
          <div className="text-center">
            <span className="text-5xl font-bold block text-white">
              {percentageScore.toFixed(1)}%
            </span>
            <span className="text-sm text-white">
              {getPerformanceMessage(percentageScore)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
