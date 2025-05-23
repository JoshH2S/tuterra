
import { useState, useEffect } from "react";
import { PremiumCard } from "@/components/ui/premium-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InternshipSession } from "@/pages/VirtualInternshipDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Award, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { InternshipTask } from "./SwipeableInternshipView";

interface FeedbackCenterProps {
  sessionData: InternshipSession;
  tasks?: InternshipTask[];
}

interface InternshipFeedback {
  id: string;
  user_id: string;
  session_id: string;
  task_title: string;
  feedback_text: string;
  quality_rating: number;
  timeliness_rating: number;
  collaboration_rating: number;
  created_at: string;
}

export function FeedbackCenter({ sessionData, tasks = [] }: FeedbackCenterProps) {
  const [feedbackItems, setFeedbackItems] = useState<InternshipFeedback[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [userResponse, setUserResponse] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  // Get completed tasks that don't have feedback yet
  const eligibleTasks = tasks.filter(task => 
    task.status === "completed"
  );

  useEffect(() => {
    async function fetchFeedback() {
      try {
        setLoading(true);
        
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return;
        
        const { data: feedback, error } = await supabase
          .from('internship_feedback')
          .select('*')
          .eq('session_id', sessionData.id)
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setFeedbackItems(feedback || []);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast({
          title: "Error",
          description: "Could not load feedback. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (sessionData?.id) {
      fetchFeedback();
    }
  }, [sessionData, toast]);

  const handleSubmitForFeedback = async () => {
    if (!selectedTaskId || !userResponse.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a task and provide your response before requesting feedback.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedTask = tasks.find(task => task.id === selectedTaskId);
      if (!selectedTask) {
        throw new Error("Task not found");
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("User not authenticated");
      }
      
      const response = await fetch("/api/generate-internship-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionData.id,
          userId: userData.user.id,
          taskId: selectedTask.id,
          taskTitle: selectedTask.title,
          taskSummary: selectedTask.description,
          userResponse,
          jobTitle: sessionData.job_title,
          industry: sessionData.industry,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate feedback");
      }
      
      const result = await response.json();
      
      // Add the new feedback to the list
      setFeedbackItems(prev => [result.feedback, ...prev]);
      
      // Reset form
      setSelectedTaskId("");
      setUserResponse("");
      
      toast({
        title: "Feedback received",
        description: "Your work has been reviewed. Check out the feedback below.",
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error submitting for feedback:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate overall performance metrics based on latest feedback ratings
  const calculatePerformanceMetrics = () => {
    if (!feedbackItems.length) return [];
    
    const latestFeedbackItems = feedbackItems.slice(0, 3); // Use last 3 feedback items for metrics
    
    const qualitySum = latestFeedbackItems.reduce((sum, item) => sum + item.quality_rating, 0);
    const timelinessSum = latestFeedbackItems.reduce((sum, item) => sum + item.timeliness_rating, 0);
    const collaborationSum = latestFeedbackItems.reduce((sum, item) => sum + item.collaboration_rating, 0);
    
    return [
      { 
        category: "Quality", 
        score: Math.round(qualitySum / latestFeedbackItems.length * 10), 
        color: "bg-green-500" 
      },
      { 
        category: "Timeliness", 
        score: Math.round(timelinessSum / latestFeedbackItems.length * 10), 
        color: "bg-yellow-500" 
      },
      { 
        category: "Collaboration", 
        score: Math.round(collaborationSum / latestFeedbackItems.length * 10), 
        color: "bg-blue-500" 
      },
    ];
  };
  
  const performanceMetrics = calculatePerformanceMetrics();
  
  return (
    <PremiumCard>
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Feedback Center</h2>
        
        {/* Submit work for feedback */}
        <div className="p-4 bg-muted/30 rounded-lg border border-muted dark:border-gray-700">
          <h3 className="text-sm font-medium mb-3">Request Supervisor Feedback</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="task-select" className="block text-sm font-medium mb-1">
                Select completed task
              </label>
              <select
                id="task-select"
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded text-sm"
                disabled={isSubmitting}
              >
                <option value="">-- Select a task --</option>
                {eligibleTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="response" className="block text-sm font-medium mb-1">
                Your work submission
              </label>
              <Textarea
                id="response"
                placeholder="Describe your work and what you learned..."
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
            </div>
            
            <Button 
              onClick={handleSubmitForFeedback}
              disabled={isSubmitting || !selectedTaskId || !userResponse.trim()}
              className="w-full touch-manipulation"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Submit for Feedback
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Recent feedback */}
        {loading ? (
          <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        ) : feedbackItems.length > 0 ? (
          <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Latest Feedback
              </h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(feedbackItems[0].created_at), 'MMM d, yyyy')}
              </div>
            </div>
            
            <div className="flex items-start gap-3 mb-3">
              <Award className="h-5 w-5 text-amber-500 mt-1" />
              <div>
                <h4 className="text-sm font-medium mb-1">{feedbackItems[0].task_title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feedbackItems[0].feedback_text}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Quality: {feedbackItems[0].quality_rating}/10</span>
              <span>Timeliness: {feedbackItems[0].timeliness_rating}/10</span>
              <span>Collaboration: {feedbackItems[0].collaboration_rating}/10</span>
            </div>
          </div>
        ) : (
          <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feedback
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No feedback available yet. Complete tasks and submit your work to receive feedback from your supervisor.
            </p>
          </div>
        )}
        
        {/* Performance metrics - show if we have feedback */}
        {performanceMetrics.length > 0 && (
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
            
            {feedbackItems.length > 1 && (
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  View All Feedback ({feedbackItems.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </PremiumCard>
  );
}
