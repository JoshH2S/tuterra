import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { isPast } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: string;
    session_id: string;
    title: string;
    description: string;
    instructions?: string | null;
    due_date: string;
    status: string;
    task_type?: string | null;
  } | null;
  userId: string;
  onSubmissionComplete: () => void;
}

export function TaskDetailsModal({ isOpen, onClose, task, userId, onSubmissionComplete }: TaskDetailsModalProps) {
  const { toast } = useToast();
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const isPastDeadline = task ? isPast(new Date(task.due_date)) : false;
  
  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not_started':
      case 'not started':
        return "bg-slate-100 text-slate-800 border-slate-200";
      case 'in_progress':
      case 'in progress':
        return "bg-amber-100 text-amber-800 border-amber-200";
      case 'submitted':
      case 'feedback_pending':
      case 'feedback pending':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'completed':
        return "bg-green-100 text-green-800 border-green-200";
      case 'overdue':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };
  
  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'feedback_pending':
        return 'Feedback Pending';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };
  
  const handleSubmit = async () => {
    if (!task || !response.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Save submission to Supabase
      const result = await supabase
        .from("internship_task_submissions" as any)
        .insert({
          session_id: task.session_id,
          task_id: task.id,
          user_id: userId,
          response_text: response,
        })
        .select("id")
        .single();
      
      if (result.error) throw result.error;
      
      // Get the submission ID from the result
      const submissionId = result.data ? (result.data as any).id : null;
      
      // Update task status to submitted
      const { error: updateError } = await supabase
        .from("internship_tasks")
        .update({ status: "feedback_pending" })
        .eq("id", task.id);
      
      if (updateError) throw updateError;
      
      // Trigger the AI feedback Edge Function
      try {
        // Fetch job title and industry from the session
        const { data: sessionData, error: sessionError } = await supabase
          .from("internship_sessions")
          .select("job_title, industry")
          .eq("id", task.session_id)
          .single();
          
        if (sessionError) throw sessionError;
        
        // Call the Edge Function to generate feedback
        const { error: functionError } = await supabase.functions.invoke('generate-internship-feedback', {
          body: {
            submission_id: submissionId,
            task_id: task.id,
            submission_text: response,
            task_description: task.description,
            task_instructions: task.instructions,
            job_title: sessionData.job_title,
            industry: sessionData.industry
          }
        });
        
        if (functionError) {
          console.error("Error generating AI feedback:", functionError);
          // Continue even if feedback generation fails
        }
      } catch (feedbackError) {
        console.error("Error in feedback generation process:", feedbackError);
        // Continue even if feedback generation fails - don't block the user
      }
      
      // Show success state
      setShowSuccess(true);
      
      // Notify parent component that submission is complete
      onSubmissionComplete();
      
    } catch (error) {
      console.error("Error submitting task:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCloseAndReset = () => {
    onClose();
    // Reset state after modal is closed
    setTimeout(() => {
      setResponse("");
      setShowSuccess(false);
    }, 300);
  };
  
  if (!task) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseAndReset}>
      <DialogContent className="sm:max-w-lg">
        {showSuccess ? (
          // Success view
          <div className="py-6 flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-xl mb-2">Task Submitted Successfully!</DialogTitle>
            <DialogDescription className="mb-6">
              Your work has been submitted. You'll receive feedback from your mentor soon.
            </DialogDescription>
            <Button onClick={handleCloseAndReset}>Return to Dashboard</Button>
          </div>
        ) : (
          // Task details and submission form
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-4 mb-2">
                <DialogTitle className="text-xl">{task.title}</DialogTitle>
                <Badge className={getStatusBadgeStyle(task.status)}>
                  {formatStatus(task.status)}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Clock className="mr-1 h-4 w-4" />
                <span>Due: {format(new Date(task.due_date), "MMMM d, yyyy")}</span>
              </div>
              <DialogDescription className="text-base mt-4">
                {task.description}
              </DialogDescription>
            </DialogHeader>
            
            {task.instructions && (
              <div className="my-4">
                <h4 className="font-medium mb-2">Instructions:</h4>
                <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-line">
                  {task.instructions}
                </div>
              </div>
            )}
            
            {isPastDeadline && (
              <div className="my-4 flex items-center p-3 bg-amber-50 text-amber-800 rounded-md">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">
                  This task is past its deadline. Your submission may still be accepted, but please contact your mentor.
                </p>
              </div>
            )}
            
            <div className="my-4">
              <h4 className="font-medium mb-2">Your Response:</h4>
              <Textarea 
                placeholder="Type your response here..." 
                className="min-h-[150px]"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseAndReset} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !response.trim()}
              >
                {isSubmitting ? <LoadingSpinner size="small" /> : "Submit Task"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 