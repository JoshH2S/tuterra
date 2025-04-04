
import { AlertTriangle, TrendingUp } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { motion } from "framer-motion";

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

        const colorClass = insight.type === 'warning'
          ? 'border-l-4 border-l-yellow-400'
          : insight.type === 'achievement'
            ? 'border-l-4 border-l-green-400'
            : 'border-l-4 border-l-blue-400';

        const bgClass = insight.type === 'warning'
          ? 'bg-yellow-50/50 dark:bg-yellow-900/10'
          : insight.type === 'achievement'
            ? 'bg-green-50/50 dark:bg-green-900/10'
            : 'bg-blue-50/50 dark:bg-blue-900/10';

        const textColor = insight.type === 'warning'
          ? 'text-yellow-600 dark:text-yellow-400'
          : insight.type === 'achievement'
            ? 'text-green-600 dark:text-green-400'
            : 'text-blue-600 dark:text-blue-400';

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <PremiumCard 
              variant="minimal" 
              className={`p-4 ${colorClass} ${bgClass}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 ${textColor} mt-0.5`} />
                <div className={textColor}>
                  <p className="font-medium">{insight.message}</p>
                  {insight.metric && (
                    <p className="text-sm">{insight.metric.toFixed(1)}{insight.type === 'improvement' ? '%' : ''}</p>
                  )}
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        );
      })}
    </section>
  );
}
