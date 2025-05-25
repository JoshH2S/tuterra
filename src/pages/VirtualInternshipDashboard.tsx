import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SwipeableInternshipView } from "@/components/internship/SwipeableInternshipView";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Briefcase, PlusCircle, Calendar, ExternalLink, MessageSquare, Award, BarChart, History } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import { TaskDetailsModal } from "@/components/internship/TaskDetailsModal";
import { TaskFeedbackDialog } from "@/components/internship/TaskFeedbackDialog";
import { FeedbackHistoryDialog } from "@/components/internship/FeedbackHistoryDialog";

// Update the interface to match what comes from the database
export interface InternshipSession {
  id: string;
  user_id: string;
  job_title: string;
  industry: string;
  job_description: string;
  duration_weeks?: number; // Optional since it might not be in the database response
  start_date?: string; // Optional since it might not be in the database response
  current_phase: number;
  created_at: string;
  questions?: Json;
}

// Interface for task data from Supabase
export interface InternshipTask {
  id: string;
  session_id: string;
  title: string;
  description: string;
  instructions?: string | null;
  due_date: string;
  status: string;
  task_order: number;
  task_type?: string | null;
  created_at: string;
  submission?: TaskSubmission | null;
}

// Interface for task submission data
interface TaskSubmission {
  id: string;
  response_text: string;
  created_at: string;
  feedback_text?: string | null;
  feedback_provided_at?: string | null;
  quality_rating?: number | null;
  timeliness_rating?: number | null;
  collaboration_rating?: number | null;
}

export default function VirtualInternshipDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [hasInternships, setHasInternships] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [internshipSession, setInternshipSession] = useState<InternshipSession | null>(null);
  const [tasks, setTasks] = useState<InternshipTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InternshipTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // For demo purposes, could be determined by user role
  const [hasFeedbackItems, setHasFeedbackItems] = useState(false);

  useEffect(() => {
    // Show a welcome toast if redirected from internship creation
    if (location.state?.newInternship) {
      toast({
        title: "Internship Created Successfully",
        description: "Your virtual internship experience has been set up and is ready to explore.",
      });
    }
  }, [location.state, toast]);

  useEffect(() => {
    async function fetchInternshipData() {
      if (!user) return;
      
      setLoading(true);
      try {
        // If a specific sessionId is provided, fetch that session
        if (sessionId) {
          const { data: sessionData, error: sessionError } = await supabase
            .from("internship_sessions")
            .select("*")
            .eq("id", sessionId)
            .eq("user_id", user.id)
            .single();
          
          if (sessionError) {
            console.error("Error fetching internship session:", sessionError);
            throw sessionError;
          }
          
          if (sessionData) {
            // Ensure all required properties are present in the session data
            const completeSessionData: InternshipSession = {
              ...sessionData as InternshipSession, // Cast to InternshipSession to avoid type errors
              duration_weeks: (sessionData as any).duration_weeks || 4, // Default to 4 weeks if missing
              start_date: (sessionData as any).start_date || sessionData.created_at // Use created_at as fallback for start_date
            };
            
            setInternshipSession(completeSessionData);
            setHasInternships(true);

            // Fetch tasks for this session
            await fetchTasks(completeSessionData.id);
          } else {
            setHasInternships(false);
          }
        } else {
          // Otherwise, check if the user has any internships
          const { data, error, count } = await supabase
            .from("internship_sessions")
            .select("*", { count: 'exact' })
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);
            
          if (error) {
            console.error("Error checking internships:", error);
            throw error;
          }
          
          if (count && count > 0 && data && data.length > 0) {
            // Ensure all required properties are present in the session data
            const completeSessionData: InternshipSession = {
              ...data[0] as InternshipSession, // Cast to InternshipSession to avoid type errors
              duration_weeks: (data[0] as any).duration_weeks || 4, // Default to 4 weeks if missing
              start_date: (data[0] as any).start_date || data[0].created_at // Use created_at as fallback for start_date
            };
            
            setInternshipSession(completeSessionData);
            setHasInternships(true);

            // Fetch tasks for this session
            await fetchTasks(completeSessionData.id);
          } else {
            setHasInternships(false);
          }
        }
      } catch (error) {
        console.error("Error fetching internship data:", error);
        setHasInternships(false);
        toast({
          title: "Error Loading Internship",
          description: "We couldn't retrieve your internship data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchInternshipData();
  }, [user, sessionId, toast]);
  
  // Function to fetch tasks for the current session
  async function fetchTasks(sessionId: string) {
    if (!user) return;
    
    setTasksLoading(true);
    try {
      // First, fetch all tasks for the session
      const { data: taskData, error: taskError } = await supabase
        .from("internship_tasks")
        .select("*")
        .eq("session_id", sessionId)
        .order("due_date", { ascending: true });
        
      if (taskError) {
        throw taskError;
      }
      
      if (taskData) {
        let submissionData: any[] = [];
        
        try {
          // Use a try/catch to handle potential errors with the submissions table
          const response = await supabase
            .from("internship_task_submissions" as any)
            .select("*")
            .eq("session_id", sessionId)
            .eq("user_id", user.id);
            
          if (response.data) {
            // Double cast to avoid TypeScript errors
            submissionData = response.data as any;
          }
        } catch (submissionError) {
          console.error("Error fetching submissions:", submissionError);
          // Continue with no submissions data
        }
        
        // Process tasks with any available submission data
        const processedTasks = taskData.map(task => {
          // Find matching submission if any
          const submission = submissionData.find(sub => sub.task_id === task.id);
          
          // Create typed submission object if we found a match
          let typedSubmission: TaskSubmission | null = null;
          
          if (submission) {
            typedSubmission = {
              id: submission.id,
              response_text: submission.response_text,
              created_at: submission.created_at,
              feedback_text: submission.feedback_text || null,
              feedback_provided_at: submission.feedback_provided_at || null,
              quality_rating: submission.quality_rating || null,
              timeliness_rating: submission.timeliness_rating || null,
              collaboration_rating: submission.collaboration_rating || null
            };
          }
          
          // Determine task status
          const isPastDueDate = isPast(new Date(task.due_date));
          let updatedStatus = task.status;
          
          // If there's a submission, mark as "submitted" or "feedback pending/received"
          if (typedSubmission) {
            updatedStatus = typedSubmission.feedback_text ? "feedback_received" : "feedback_pending";
          } 
          // If past due date and no submission, mark as overdue
          else if (isPastDueDate && task.status !== "completed") {
            updatedStatus = "overdue";
          }
          
          // Return the task with updated status and submission data
          return {
            ...task,
            status: updatedStatus,
            submission: typedSubmission
          };
        });
        
        setTasks(processedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error Loading Tasks",
        description: "We couldn't retrieve your task data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTasksLoading(false);
    }
  }

  // Helper function to get status badge style
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
      case 'feedback_received':
      case 'feedback_available':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'completed':
        return "bg-green-100 text-green-800 border-green-200";
      case 'overdue':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Helper function to format status display
  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'feedback_pending':
        return 'Processing Feedback';
      case 'feedback_received':
      case 'feedback_available':
        return 'Feedback Available';
      case 'completed':
        return 'Completed';
      case 'overdue':
        return 'Overdue';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  // Function to handle opening the task details modal
  const handleOpenTaskDetails = (task: InternshipTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Function to handle task submission completion
  const handleTaskSubmissionComplete = () => {
    // Refresh tasks to get updated status
    if (internshipSession) {
      fetchTasks(internshipSession.id);
    }
  };

  // Function to open the feedback modal
  const handleViewFeedback = (task: InternshipTask) => {
    setSelectedTask(task);
    setIsFeedbackModalOpen(true);
  };

  // Add a function to check if there are feedback items
  useEffect(() => {
    if (tasks.length > 0) {
      const hasAnyFeedback = tasks.some(task => 
        task.submission?.feedback_text !== null && 
        task.submission?.feedback_text !== undefined
      );
      setHasFeedbackItems(hasAnyFeedback);
    }
  }, [tasks]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="large" />
          <p className="text-muted-foreground">Loading your internship experience...</p>
        </div>
      </div>
    );
  }
  
  if (hasInternships === false) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg">
          <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Virtual Internship Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get hands-on experience by creating a virtual internship tailored to your career goals
          </p>
          <Button 
            onClick={() => navigate("/dashboard/internship/create")} 
            className="gap-2 touch-manipulation"
          >
            <PlusCircle className="h-5 w-5" />
            Create Virtual Internship
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <SwipeableInternshipView sessionData={internshipSession!} />
      
      {/* Feedback History Button (if there are feedback items) */}
      {hasFeedbackItems && internshipSession && (
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsHistoryModalOpen(true)}
          >
            <History className="h-4 w-4" />
            View Feedback History
          </Button>
        </div>
      )}
      
      {/* Current Tasks Section */}
      <div className="mt-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Current Tasks</h2>
        
        {tasksLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="default" />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">📭 No tasks assigned yet.</h3>
              <p className="text-sm text-muted-foreground">
                Your tasks will appear here once they are assigned.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="h-full flex flex-col" id={`task-${task.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <Badge className={getStatusBadgeStyle(task.status)}>
                      {formatStatus(task.status)}
                    </Badge>
                  </div>
                  <CardDescription className="mt-2">
                    Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{task.description.substring(0, 150)}
                    {task.description.length > 150 ? '...' : ''}
                  </p>
                  
                  {task.status === 'feedback_received' && task.submission?.feedback_text && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1 mb-1">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium">Recent Feedback</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        "{task.submission.feedback_text.substring(0, 100).replace(/#+\s*|_|\*\*/g, '')}..."
                      </p>
                      
                      {task.submission.quality_rating && task.submission.timeliness_rating && task.submission.collaboration_rating && (
                        <div className="flex gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">Q:</span>
                            <span className="text-xs font-medium">{task.submission.quality_rating}/10</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">T:</span>
                            <span className="text-xs font-medium">{task.submission.timeliness_rating}/10</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">C:</span>
                            <span className="text-xs font-medium">{task.submission.collaboration_rating}/10</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 flex flex-col gap-2">
                  {task.status === 'feedback_received' && task.submission?.feedback_text ? (
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => handleViewFeedback(task)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Feedback
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleOpenTaskDetails(task)}
                    >
                      View Details
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {user && (
        <TaskDetailsModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={selectedTask}
          userId={user.id}
          onSubmissionComplete={handleTaskSubmissionComplete}
        />
      )}

      {/* Task Feedback Modal */}
      {selectedTask && (
        <TaskFeedbackDialog
          isOpen={isFeedbackModalOpen}
          onClose={() => {
            setIsFeedbackModalOpen(false);
            // Refresh data after closing feedback dialog (in case feedback was added)
            if (internshipSession) {
              fetchTasks(internshipSession.id);
            }
          }}
          task={selectedTask}
          submission={selectedTask.submission}
          isAdmin={isAdmin}
        />
      )}
      
      {/* Feedback History Modal */}
      {internshipSession && (
        <FeedbackHistoryDialog
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          sessionId={internshipSession.id}
        />
      )}
    </div>
  );
}
