import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Star, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface TaskSubmission {
  id: string;
  task_id: string;
  task_title: string;
  response_text: string;
  feedback_text?: string | null;
  quality_rating?: number | null;
  timeliness_rating?: number | null;
  collaboration_rating?: number | null;
  overall_assessment?: string | null;
  feedback_provided_at?: string | null;
  created_at: string;
}

interface FeedbackHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function FeedbackHistoryDialog({ 
  isOpen, 
  onClose, 
  sessionId
}: FeedbackHistoryDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  
  useEffect(() => {
    if (isOpen && user && sessionId) {
      fetchFeedbackHistory();
    }
  }, [isOpen, user, sessionId]);
  
  async function fetchFeedbackHistory() {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch tasks for the session
      const { data: tasksData, error: tasksError } = await supabase
        .from("internship_tasks")
        .select("id, title")
        .eq("session_id", sessionId);
        
      if (tasksError) throw tasksError;
      
      // Fetch submissions with feedback
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("internship_task_submissions")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .not("feedback_text", "is", null)
        .order("created_at", { ascending: false });
        
      if (submissionsError) throw submissionsError;
      
      if (submissionsData && tasksData) {
        // Map task titles to submissions
        const processedSubmissions = submissionsData.map(submission => {
          const matchingTask = tasksData.find(task => task.id === submission.task_id);
          return {
            ...submission,
            task_title: matchingTask ? matchingTask.title : "Unknown Task"
          };
        });
        
        setSubmissions(processedSubmissions);
        
        // Set first submission as selected by default
        if (processedSubmissions.length > 0) {
          setSelectedSubmission(processedSubmissions[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching feedback history:", error);
    } finally {
      setLoading(false);
    }
  }
  
  // Helper function to render rating
  const renderRating = (label: string, rating?: number | null) => {
    const value = rating || 0;
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium">{label}</span>
          <div className="flex items-center">
            <span className="text-xs font-bold mr-1">{value}/10</span>
            <Star className="h-3 w-3 text-amber-500" fill={value > 5 ? "currentColor" : "none"} />
          </div>
        </div>
        <Progress value={value * 10} className="h-2" />
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Feedback History</DialogTitle>
          <DialogDescription>
            View all feedback received for your internship tasks
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <LoadingSpinner size="default" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center my-8">
            <p className="text-muted-foreground">No feedback received yet.</p>
          </div>
        ) : (
          <Tabs defaultValue="list" className="mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="detail">Detailed View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card 
                    key={submission.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{submission.task_title}</CardTitle>
                        {submission.overall_assessment && (
                          <Badge variant="outline">{submission.overall_assessment}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Feedback received on {format(new Date(submission.feedback_provided_at || submission.created_at), "MMM d, yyyy")}
                      </p>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      {submission.quality_rating && submission.timeliness_rating && submission.collaboration_rating && (
                        <div className="flex gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">Quality:</span>
                            <span className="text-xs font-medium">{submission.quality_rating}/10</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">Timeliness:</span>
                            <span className="text-xs font-medium">{submission.timeliness_rating}/10</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">Collaboration:</span>
                            <span className="text-xs font-medium">{submission.collaboration_rating}/10</span>
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {submission.feedback_text?.replace(/#+\s*|_|\*\*/g, '').substring(0, 150)}...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="detail">
              {selectedSubmission ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedSubmission.task_title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Submitted on {format(new Date(selectedSubmission.created_at), "MMMM d, yyyy")}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Your Submission</h4>
                        <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                          {selectedSubmission.response_text}
                        </div>
                      </div>
                      
                      {selectedSubmission.quality_rating && selectedSubmission.timeliness_rating && selectedSubmission.collaboration_rating && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 flex items-center">
                            <Star className="h-4 w-4 mr-2 text-amber-500" fill="currentColor" />
                            Performance Ratings
                          </h4>
                          
                          {selectedSubmission.overall_assessment && (
                            <div className="mb-3 flex justify-between items-center">
                              <span className="text-xs font-medium">Overall Assessment</span>
                              <Badge className="ml-auto" variant="outline">{selectedSubmission.overall_assessment}</Badge>
                            </div>
                          )}
                          
                          {renderRating("Quality", selectedSubmission.quality_rating)}
                          {renderRating("Timeliness", selectedSubmission.timeliness_rating)}
                          {renderRating("Collaboration", selectedSubmission.collaboration_rating)}
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-primary" />
                          Feedback
                        </h4>
                        <div className="text-sm prose prose-sm max-w-none bg-primary/5 p-3 rounded-md whitespace-pre-wrap">
                          {selectedSubmission.feedback_text}
                        </div>
                        {selectedSubmission.feedback_provided_at && (
                          <div className="mt-2 text-xs text-right text-muted-foreground">
                            Generated on {format(new Date(selectedSubmission.feedback_provided_at), "MMMM d, yyyy")}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const currentIndex = submissions.findIndex(s => s.id === selectedSubmission.id);
                        if (currentIndex > 0) {
                          setSelectedSubmission(submissions[currentIndex - 1]);
                        }
                      }}
                      disabled={submissions.findIndex(s => s.id === selectedSubmission.id) === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const currentIndex = submissions.findIndex(s => s.id === selectedSubmission.id);
                        if (currentIndex < submissions.length - 1) {
                          setSelectedSubmission(submissions[currentIndex + 1]);
                        }
                      }}
                      disabled={submissions.findIndex(s => s.id === selectedSubmission.id) === submissions.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center my-8">
                  <p className="text-muted-foreground">Select a submission to view details</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
} 