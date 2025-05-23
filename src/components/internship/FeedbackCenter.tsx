
import { PremiumCard } from "@/components/ui/premium-card";
import { Button } from "@/components/ui/button";
import { InternshipSession } from "@/pages/VirtualInternshipDashboard";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackCenterProps {
  sessionData: InternshipSession;
}

interface DeliverableFeedback {
  id: string;
  deliverable_id: string;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
  created_at: string;
}

export function FeedbackCenter({ sessionData }: FeedbackCenterProps) {
  // Mock performance metrics
  const [feedbackItems, setFeedbackItems] = useState<DeliverableFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Performance metrics by category
  const performanceMetrics = [
    { category: "Quality", score: 85, color: "bg-green-500" },
    { category: "Timeliness", score: 75, color: "bg-yellow-500" },
    { category: "Collaboration", score: 90, color: "bg-blue-500" },
  ];

  useEffect(() => {
    async function fetchFeedback() {
      try {
        setLoading(true);
        
        // First get the deliverables
        const { data: deliverables, error: deliverableError } = await supabase
          .from('internship_deliverables')
          .select('id')
          .eq('user_id', sessionData.user_id);
        
        if (deliverableError) throw deliverableError;
        
        if (!deliverables || !deliverables.length) {
          setLoading(false);
          return;
        }
        
        // Then get feedback for those deliverables
        const deliverableIds = deliverables.map(d => d.id);
        const { data: feedback, error: feedbackError } = await supabase
          .from('internship_feedback')
          .select('*')
          .in('deliverable_id', deliverableIds)
          .order('created_at', { ascending: false });
        
        if (feedbackError) throw feedbackError;
        
        setFeedbackItems(feedback || []);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (sessionData?.id) {
      fetchFeedback();
    }
  }, [sessionData]);
  
  return (
    <PremiumCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Feedback Center</h2>
        
        {/* Recent feedback */}
        {loading ? (
          <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        ) : feedbackItems.length > 0 ? (
          <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recent Feedback
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feedbackItems[0].feedback}
            </p>
          </div>
        ) : (
          <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feedback
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No feedback available yet. Complete and submit tasks to receive feedback from your supervisor.
            </p>
          </div>
        )}
        
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
                    className={`${metric.color} h-2.5 rounded-full transition-all duration-1000 ease-in-out`}
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
