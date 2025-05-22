
import { PremiumCard } from "@/components/ui/premium-card";
import { Button } from "@/components/ui/button";

export function FeedbackCenter() {
  // Mock performance metrics
  const performanceMetrics = [
    { category: "Quality", score: 85, color: "bg-green-500" },
    { category: "Timeliness", score: 75, color: "bg-yellow-500" },
    { category: "Collaboration", score: 90, color: "bg-blue-500" },
  ];
  
  return (
    <PremiumCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Feedback Center</h2>
        
        {/* Recent feedback */}
        <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recent Feedback from Sarah Chen
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            "Your marketing analysis shows strong critical thinking. Next time, try to incorporate more competitive insights and consider our target demographic's specific needs."
          </p>
        </div>
        
        {/* Performance metrics */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Performance Summary</h3>
          
          <div className="space-y-3">
            {performanceMetrics.map((metric) => (
              <div key={metric.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{metric.category}</span>
                  <span className="font-medium">{metric.score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className={`${metric.color} h-2.5 rounded-full`}
                    style={{ width: `${metric.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View Full Report
            </Button>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
