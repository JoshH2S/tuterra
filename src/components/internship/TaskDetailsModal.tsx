import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, Link, FileText, Calendar, Upload, Plus, X, Download, ExternalLink, BookOpen, Target, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadField } from "./FileUploadField";
import { InternshipSession, InternshipTask } from "@/types/internship";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: InternshipTask;
  userId: string;
  sessionData: InternshipSession;
  tasks: InternshipTask[];
  onSubmissionComplete?: () => void;
}

interface TaskDetail {
  id: string;
  task_id: string;
  background: string;
  instructions?: string;
  deliverables?: string;
  success_criteria?: string;
  resources?: string;
  created_at: string;
  updated_at: string;
  generated_by?: string;
  generation_status?: string;
}

interface TaskUpdateData {
  title: string;
  description: string;
  due_date: string;
  status: string;
  task_type?: string | null;
  instructions?: string | null;
}

interface Resource {
  title: string;
  description: string;
  url?: string;
}

// Add this helper function to parse JSON arrays from strings
const parseJsonArray = (jsonString?: string): string[] => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [jsonString];
  } catch (e) {
    console.error("Error parsing JSON array:", e);
    return [jsonString];
  }
};

export function TaskDetailsModal({ 
  isOpen, 
  onClose, 
  task, 
  userId, 
  sessionData,
  tasks,
  onSubmissionComplete 
}: TaskDetailsModalProps) {
  const { toast } = useToast();
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [taskDetails, setTaskDetails] = useState<TaskDetail | null>(null);
  const [taskUpdateData, setTaskUpdateData] = useState<TaskUpdateData>({
    title: task?.title || "",
    description: task?.description || "",
    due_date: task?.due_date || "",
    status: task?.status || "not_started",
    task_type: task?.task_type,
    instructions: task?.instructions
  });
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [submissionType, setSubmissionType] = useState<'text' | 'file' | 'both'>('text');
  const [fileData, setFileData] = useState<{
    url: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);
  
  // Helper function to check if a task is overdue (timezone-aware)
  const isTaskOverdue = (dueDate: string): boolean => {
    const now = new Date();
    const due = new Date(dueDate);
    return now.getTime() > due.getTime();
  };
  
  const isPastDeadline = task ? isTaskOverdue(task.due_date) : false;
  
  // Fetch detailed task content when modal opens
  useEffect(() => {
    if (isOpen && task) {
      fetchTaskDetails();
    }
  }, [isOpen, task]);
  
  const fetchTaskDetails = async () => {
    if (!task) return;
    
    setIsLoadingDetails(true);
    
    try {
      // First check if details already exist in the database
      const { data, error } = await supabase
        .from("internship_task_details")
        .select("*")
        .eq("task_id", task.id)
        .limit(1);
      
      if (data && data.length > 0) {
        setTaskDetails(data[0] as TaskDetail);
      } else {
        // If details don't exist, generate them using the Edge Function
        // Fetch job title and industry from the session first
        const { data: sessionData, error: sessionError } = await supabase
          .from("internship_sessions")
          .select("job_title, industry")
          .eq("id", task.session_id)
          .limit(1);
          
        if (sessionError) throw sessionError;
        
        const sessionInfo = sessionData && sessionData.length > 0 ? sessionData[0] : null;
        if (!sessionInfo) throw new Error("Session data not found");
        
        // Call the Edge Function to generate task details
        const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-task-details', {
          body: {
            task_id: task.id,
            task_title: task.title,
            task_description: task.description,
            job_title: sessionInfo.job_title,
            industry: sessionInfo.industry
          }
        });
        
        if (functionError) throw functionError;
        
        if (functionData && functionData.data) {
          setTaskDetails(functionData.data as TaskDetail);
        }
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast({
        title: "Error Loading Task Details",
        description: "We couldn't load the detailed task information. You can still submit your response.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };
  
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
  
  const validateTaskDueDate = (dueDate: Date, sessionStartDate: string, durationWeeks: number) => {
    const startDate = new Date(sessionStartDate);
    const endDate = addDays(startDate, durationWeeks * 7);
    
    // Ensure due date is within the internship period
    if (dueDate < startDate || dueDate > endDate) {
      return {
        isValid: false,
        message: "Due date must be within the internship period"
      };
    }
    
    // Get the week number for this due date
    const weekNumber = Math.ceil((dueDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Get the start and end of the week
    const weekStart = startOfWeek(dueDate);
    const weekEnd = endOfWeek(dueDate);
    
    // Check if there are already 2 tasks in this week
    const tasksInWeek = tasks.filter(t => {
      const taskDate = new Date(t.due_date);
      return taskDate >= weekStart && taskDate <= weekEnd && t.id !== task.id; // Exclude current task
    });
    
    if (tasksInWeek.length >= 2) {
      return {
        isValid: false,
        message: "Maximum of 2 tasks allowed per week"
      };
    }
    
    return {
      isValid: true,
      message: ""
    };
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    // Validate due date if it's being modified
    if (taskUpdateData.due_date) {
      const validation = validateTaskDueDate(
        new Date(taskUpdateData.due_date),
        sessionData.start_date || sessionData.created_at,
        sessionData.duration_weeks || 4
      );
      
      if (!validation.isValid) {
        toast({
          title: "Invalid Due Date",
          description: validation.message,
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Save submission to Supabase
      const { data: submissionData, error: submissionError } = await supabase
        .from("internship_task_submissions")
        .insert({
          session_id: task.session_id,
          task_id: task.id,
          user_id: userId,
          response_text: response,
          file_url: fileData?.url || null,
          file_name: fileData?.name || null,
          file_type: fileData?.type || null,
          file_size: fileData?.size || null,
          content_type: submissionType
        })
        .select("id")
        .limit(1);
      
      if (submissionError) throw submissionError;
      
      // Get the submission ID from the result
      // Use type assertion to tell TypeScript the expected structure
      type SubmissionResult = { id: string };
      const submissions = submissionData as SubmissionResult[] | null;
      const submissionId = submissions && submissions.length > 0 ? submissions[0].id : null;
      
      if (!submissionId) {
        throw new Error("Failed to get submission ID");
      }
      
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
          .limit(1);
          
        if (sessionError) throw sessionError;
        
        const sessionInfo = sessionData && sessionData.length > 0 ? sessionData[0] : null;
        if (!sessionInfo) throw new Error("Session data not found");
        
        // Call the Edge Function to generate feedback
        const { error: functionError } = await supabase.functions.invoke('generate-internship-feedback', {
          body: {
            submission_id: submissionId,
            task_id: task.id,
            submission_text: response,
            task_description: task.description,
            task_instructions: taskDetails?.instructions || task.instructions,
            job_title: sessionInfo.job_title,
            industry: sessionInfo.industry
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
      onSubmissionComplete?.();
      
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
      setActiveTab("overview");
    }, 300);
  };
  
  const parseResources = (jsonString?: string): Resource[] => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Error parsing resources:", e);
      return [];
    }
  };
  
  if (!task) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseAndReset}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
            </DialogHeader>
            
            {isLoadingDetails ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="default" />
              </div>
            ) : (
              <>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details" disabled={!taskDetails}>Details</TabsTrigger>
                    <TabsTrigger value="resources" disabled={false}>Resources</TabsTrigger>
                    <TabsTrigger value="submit">Submit</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-0">
                    <DialogDescription className="text-base">
                      {task.description}
                    </DialogDescription>
                    
                    {taskDetails && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Background:</h4>
                        <p className="text-sm">{taskDetails.background}</p>
                      </div>
                    )}
                    
                    {(taskDetails?.instructions || task.instructions) && (
                      <div className="mt-4">
                <h4 className="font-medium mb-2">Instructions:</h4>
                        {taskDetails?.instructions ? (
                          <div className="text-sm bg-muted p-3 rounded-md">
                            <ol className="list-decimal pl-5 space-y-2">
                              {parseJsonArray(taskDetails.instructions).map((item, index) => (
                                <li key={index} className="pl-1">
                                  {item.replace(/^Step \d+:\s*/i, '')}
                                </li>
                              ))}
                            </ol>
                          </div>
                        ) : (
                <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-line">
                  {task.instructions}
                </div>
                        )}
              </div>
            )}
            
            {isPastDeadline && (
                      <div className="mt-4 flex items-center p-3 bg-amber-50 text-amber-800 rounded-md">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">
                  This task is past its deadline. Your submission may still be accepted, but please contact your mentor.
                </p>
              </div>
            )}
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-0">
                    {taskDetails && (
                      <>
                        {taskDetails.instructions && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Instructions:</h4>
                            <div className="text-sm bg-muted p-3 rounded-md">
                              <ol className="list-decimal pl-5 space-y-2">
                                {parseJsonArray(taskDetails.instructions).map((item, index) => (
                                  <li key={index} className="pl-1">
                                    {item.replace(/^Step \d+:\s*/i, '')}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}
                        
                        {taskDetails.deliverables && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Deliverables:</h4>
                            <div className="text-sm bg-muted p-3 rounded-md">
                              <ul className="list-disc pl-5 space-y-1">
                                {parseJsonArray(taskDetails.deliverables).map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        
                        {taskDetails.success_criteria && (
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Success Criteria:</h4>
                            <div className="text-sm bg-muted p-3 rounded-md">
                              <ul className="list-disc pl-5 space-y-1">
                                {parseJsonArray(taskDetails.success_criteria).map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="resources" className="mt-0">
                    <div className="grid gap-3">
                      {taskDetails && taskDetails.resources ? (
                        parseResources(taskDetails.resources).map((resource, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Link className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-sm">{resource.title}</h5>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {resource.description}
                                  </p>
                                  {resource.url && (
                                    <a 
                                      href={resource.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary mt-2 inline-block hover:underline"
                                    >
                                      Open Resource
                                    </a>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Link className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-sm">Documentation Resources</h5>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Access helpful guides and documentation related to this task.
                                  </p>
                                  <a 
                                    href="https://www.tuterra.com/resources" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary mt-2 inline-block hover:underline"
                                  >
                                    Open Resource
                                  </a>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Link className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-sm">Task Template</h5>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Use this template as a starting point for your work.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="submit" className="mt-0">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Submission Type</h4>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="text"
                                checked={submissionType === 'text'}
                                onChange={(e) => setSubmissionType('text')}
                                className="form-radio"
                              />
                              <span>Text Only</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="file"
                                checked={submissionType === 'file'}
                                onChange={(e) => setSubmissionType('file')}
                                className="form-radio"
                              />
                              <span>File Only</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="both"
                                checked={submissionType === 'both'}
                                onChange={(e) => setSubmissionType('both')}
                                className="form-radio"
                              />
                              <span>Both Text & File</span>
                            </label>
                          </div>
                        </div>

                        {(submissionType === 'text' || submissionType === 'both') && (
                          <div>
                            <h4 className="font-medium mb-2">Your Response:</h4>
                            <Textarea 
                              placeholder="Type your response here..." 
                              className="min-h-[150px]"
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              disabled={isSubmitting}
                            />
                          </div>
                        )}

                        {(submissionType === 'file' || submissionType === 'both') && (
                          <div>
                            <h4 className="font-medium mb-2">Upload File:</h4>
                            <FileUploadField
                              onFileUpload={setFileData}
                              onFileRemove={() => setFileData(null)}
                              taskId={task?.id || ''}
                              sessionId={task?.session_id || ''}
                              userId={userId}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleCloseAndReset} disabled={isSubmitting}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmit} 
                          disabled={isSubmitting || (!response.trim() && !fileData)}
                        >
                          {isSubmitting ? <LoadingSpinner size="small" /> : "Submit Task"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 