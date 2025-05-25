import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Clock, Award, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TaskFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    description: string;
    due_date: string;
  } | null;
  submission?: {
    id: string;
    response_text: string;
    created_at: string;
    feedback_text?: string | null;
    quality_rating?: number | null;
    timeliness_rating?: number | null;
    collaboration_rating?: number | null;
    overall_assessment?: string | null;
    feedback_provided_at?: string | null;
  } | null;
  isAdmin?: boolean;
}

export function TaskFeedbackDialog({ 
  isOpen, 
  onClose, 
  task, 
  submission
}: TaskFeedbackDialogProps) {
  if (!task || !submission) return null;
  
  const hasFeedback = !!submission.feedback_text;
  const hasRatings = !!submission.quality_rating || !!submission.timeliness_rating || !!submission.collaboration_rating;
  
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{hasFeedback ? "AI Feedback" : "View Submission"}</DialogTitle>
          <DialogDescription>
            {format(new Date(task.due_date), "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div>
            <h3 className="font-medium mb-2">{task.title}</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Your Submission</h4>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Submitted: {format(new Date(submission.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>
              <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                {submission.response_text}
              </div>
            </CardContent>
          </Card>
          
          {hasFeedback ? (
            <>
              {hasRatings && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 mr-2 text-amber-500" fill="currentColor" />
                      <h4 className="font-medium text-sm">Performance Ratings</h4>
                    </div>
                    
                    {submission.overall_assessment && (
                      <div className="mb-3 flex justify-between items-center">
                        <span className="text-xs font-medium">Overall Assessment</span>
                        <Badge className="ml-auto" variant="outline">{submission.overall_assessment}</Badge>
                      </div>
                    )}
                    
                    {renderRating("Quality", submission.quality_rating)}
                    {renderRating("Timeliness", submission.timeliness_rating)}
                    {renderRating("Collaboration", submission.collaboration_rating)}
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Award className="h-4 w-4 mr-2 text-primary" />
                    <h4 className="font-medium text-sm">AI-Generated Feedback</h4>
                  </div>
                  <div className="text-sm prose prose-sm max-w-none bg-primary/5 p-3 rounded-md whitespace-pre-wrap">
                    {submission.feedback_text}
                  </div>
                  {submission.feedback_provided_at && (
                    <div className="mt-2 text-xs text-right text-muted-foreground">
                      Generated on {format(new Date(submission.feedback_provided_at), "MMMM d, yyyy")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-4">
              <Badge variant="outline" className="mx-auto">Processing Feedback</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                AI is analyzing your submission and will provide feedback shortly.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 