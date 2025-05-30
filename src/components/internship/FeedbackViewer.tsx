import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-states";
import ReactMarkdown from "react-markdown";
import { Progress } from "@/components/ui/progress";

interface FeedbackViewerProps {
  submissionId: string;
  taskId: string;
}

interface FeedbackData {
  id: string;
  task_id: string;
  user_id: string;
  response_text: string;
  feedback_text: string;
  quality_rating: number;
  timeliness_rating: number;
  collaboration_rating: number;
  overall_assessment: string;
  feedback_provided_at: string;
}

export function FeedbackViewer({ submissionId, taskId }: FeedbackViewerProps) {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("internship_task_submissions")
          .select("*, internship_tasks(title)")
          .eq("id", submissionId)
          .single();
          
        if (error) throw error;
        
        setFeedback(data as unknown as FeedbackData);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    if (submissionId) {
      fetchFeedback();
    }
  }, [submissionId]);
  
  const getAssessmentColor = (assessment: string) => {
    switch (assessment?.toLowerCase()) {
      case 'excellent':
        return "bg-green-100 text-green-800 border-green-200";
      case 'good':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'satisfactory':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'needs improvement':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };
  
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "bg-green-600";
    if (rating >= 6) return "bg-blue-600";
    if (rating >= 4) return "bg-yellow-600";
    return "bg-red-600";
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="default" />
      </div>
    );
  }
  
  if (error || !feedback) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            {error || "No feedback available yet."}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg font-medium">Mentor Feedback</CardTitle>
          {feedback.overall_assessment && (
            <Badge className={getAssessmentColor(feedback.overall_assessment)}>
              {feedback.overall_assessment}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Ratings section */}
        {(feedback.quality_rating || feedback.timeliness_rating || feedback.collaboration_rating) && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {feedback.quality_rating > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Quality</span>
                  <span className="text-sm text-muted-foreground">{feedback.quality_rating}/10</span>
                </div>
                <Progress
                  value={feedback.quality_rating * 10}
                  className="h-2"
                  indicatorClassName={getRatingColor(feedback.quality_rating)}
                />
              </div>
            )}
            
            {feedback.timeliness_rating > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Timeliness</span>
                  <span className="text-sm text-muted-foreground">{feedback.timeliness_rating}/10</span>
                </div>
                <Progress
                  value={feedback.timeliness_rating * 10}
                  className="h-2"
                  indicatorClassName={getRatingColor(feedback.timeliness_rating)}
                />
              </div>
            )}
            
            {feedback.collaboration_rating > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Collaboration</span>
                  <span className="text-sm text-muted-foreground">{feedback.collaboration_rating}/10</span>
                </div>
                <Progress
                  value={feedback.collaboration_rating * 10}
                  className="h-2"
                  indicatorClassName={getRatingColor(feedback.collaboration_rating)}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Detailed feedback */}
        {feedback.feedback_text ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>
              {feedback.feedback_text}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Feedback is being prepared. Check back soon!
          </div>
        )}
        
        {feedback.feedback_provided_at && (
          <div className="mt-4 text-xs text-muted-foreground text-right">
            Feedback provided on {new Date(feedback.feedback_provided_at).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 