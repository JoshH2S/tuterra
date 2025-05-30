import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Clock, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FinalProjectForm } from "@/components/internship/FinalProjectForm";
import { format, addDays } from "date-fns";

export default function SubmitFinalProjectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isCompletable, setIsCompletable] = useState(false);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [sessionStartDate, setSessionStartDate] = useState<string | null>(null);
  const [submissionDeadline, setSubmissionDeadline] = useState<Date | null>(null);

  useEffect(() => {
    // Redirect if no sessionId
    if (!sessionId) {
      navigate("/dashboard/virtual-internship");
      return;
    }

    const checkInternshipStatus = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Check if the internship session exists and belongs to the user
        const { data: sessionData, error: sessionError } = await supabase
          .from("internship_sessions")
          .select("id, is_completed, start_date, created_at, duration_weeks")
          .eq("id", sessionId)
          .eq("user_id", user.id)
          .single();
        
        if (sessionError) {
          throw new Error("Internship session not found");
        }
        
        // Store the session start date for deadline calculation
        const startDate = (sessionData as any).start_date || (sessionData as any).created_at;
        setSessionStartDate(startDate);
        
        // Calculate submission deadline (end of internship)
        const durationWeeks = (sessionData as any).duration_weeks || 4;
        const internshipEndDate = addDays(new Date(startDate), durationWeeks * 7);
        setSubmissionDeadline(internshipEndDate);
        
        // If internship is already completed, redirect to completion page
        if ((sessionData as any).is_completed) {
          setIsAlreadyCompleted(true);
          
          // Check if there's a submission for this session
          const { data: submissionData } = await supabase
            .from("internship_final_submissions" as any)
            .select("id")
            .eq("session_id", sessionId)
            .eq("user_id", user.id)
            .single();
            
          if (submissionData) {
            // Redirect to completion page
            navigate(`/dashboard/virtual-internship/completion?sessionId=${sessionId}`);
            return;
          }
        }
        
        // Check if user has completed enough tasks to submit final project
        const { data: tasksData, error: tasksError } = await supabase
          .from("internship_tasks")
          .select("id, status")
          .eq("session_id", sessionId);
        
        if (tasksError) {
          throw tasksError;
        }
        
        // Calculate completion rate (at least 75% of tasks should be completed)
        const totalTasks = tasksData.length;
        const completedTasks = tasksData.filter(task => task.status === 'completed').length;
        const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
        
        setIsCompletable(completionRate >= 0.75);
        
        // Add the submission deadline to the events table if it doesn't exist yet
        if ((sessionData as any).is_completed === false) {
          // Check if deadline event already exists
          const { data: existingEvents } = await supabase
            .from("internship_events")
            .select("id")
            .eq("session_id", sessionId)
            .eq("type", "deadline")
            .ilike("title", "%Final Project%");
            
          if (!existingEvents?.length) {
            // Create a deadline event for the final project
            await supabase
              .from("internship_events")
              .insert({
                session_id: sessionId,
                title: "Final Project Submission Deadline",
                type: "deadline",
                date: internshipEndDate.toISOString(),
              });
          }
        }
        
      } catch (error) {
        console.error("Error checking internship status:", error);
        toast({
          title: "Error",
          description: "There was an issue checking your internship status.",
          variant: "destructive"
        });
        navigate("/dashboard/virtual-internship");
      } finally {
        setLoading(false);
      }
    };

    checkInternshipStatus();
  }, [sessionId, user, navigate, toast]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4 min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If already completed, loading state will handle the redirection
  if (isAlreadyCompleted) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4 min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="flex items-center mb-4" 
          onClick={() => navigate(`/dashboard/virtual-internship`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Internship
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Submit Final Project</h1>
        <p className="text-muted-foreground">
          Complete your virtual internship by submitting your final project
        </p>
      </div>

      {submissionDeadline && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Submission Deadline</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Your final project is due by <span className="font-medium">{format(submissionDeadline, "MMMM d, yyyy")}</span>.
                This deadline has been added to your internship calendar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isCompletable ? (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-300 mb-2">
            Complete More Tasks First
          </h2>
          <p className="text-amber-700 dark:text-amber-400 mb-4">
            You need to complete at least 75% of your assigned tasks before submitting your final project.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/dashboard/virtual-internship`)}
          >
            Return to Tasks
          </Button>
        </div>
      ) : (
        <FinalProjectForm 
          sessionId={sessionId!} 
          userId={user!.id} 
        />
      )}
    </div>
  );
} 