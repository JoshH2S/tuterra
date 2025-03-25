
import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp } from "lucide-react";

interface Insight {
  type: 'warning' | 'achievement' | 'improvement';
  message: string;
  metric?: number;
}

interface InsightsSectionProps {
  insights: Insight[];
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 gap-3">
      {insights.map((insight, index) => {
        const Icon = insight.type === 'warning' 
          ? AlertTriangle 
          : insight.type === 'achievement' 
            ? TrendingUp 
            : TrendingUp;

        const bgColor = insight.type === 'warning'
          ? 'bg-yellow-50 border-yellow-200'
          : insight.type === 'achievement'
            ? 'bg-green-50 border-green-200'
            : 'bg-blue-50 border-blue-200';

        const textColor = insight.type === 'warning'
          ? 'text-yellow-600'
          : insight.type === 'achievement'
            ? 'text-green-600'
            : 'text-blue-600';

        return (
          <Card key={index} className={`${bgColor} p-4`}>
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 ${textColor} mt-0.5`} />
              <div className={textColor}>
                <p className="font-medium">{insight.message}</p>
                {insight.metric && (
                  <p className="text-sm">{insight.metric.toFixed(1)}{insight.type === 'improvement' ? '%' : ''}</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
