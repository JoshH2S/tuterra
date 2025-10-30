import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, Link, FileText, Calendar, Upload, Plus, X, Download, ExternalLink, BookOpen, Target, CheckCircle, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadField } from "./FileUploadField";
import { InternshipSession, InternshipTask } from "@/types/internship";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: InternshipTask;
  userId: string;
  sessionData: InternshipSession;
  tasks: InternshipTask[];
  onSubmissionComplete?: (showFeedback: boolean) => void;
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
  search_guidance?: string;
  website?: string;
  url?: string; // Keep for backward compatibility
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
  
  // New states for feedback handling
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    feedback_text: string;
    quality_rating: number;
    timeliness_rating: number;
    collaboration_rating: number;
    overall_assessment: string;
    feedback_provided_at: string;
  } | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [isCheckingExistingSubmission, setIsCheckingExistingSubmission] = useState(false);
  
  // Helper function to check if a task is overdue (timezone-aware)
  const isTaskOverdue = (dueDate: string): boolean => {
    const now = new Date();
    const due = new Date(dueDate);
    return now.getTime() > due.getTime();
  };
  
  const isPastDeadline = task ? isTaskOverdue(task.due_date) : false;
  
  // Validation function for different submission types
  const validateSubmissionData = () => {
    switch (submissionType) {
      case 'text':
        if (!response.trim()) {
          return {
            isValid: false,
            message: "Please provide a text response for your submission."
          };
        }
        return { isValid: true, message: "" };
        
      case 'file':
        if (!fileData || !fileData.url) {
          return {
            isValid: false,
            message: "Please upload a file for your submission. Make sure the file upload completes successfully."
          };
        }
        return { isValid: true, message: "" };
        
      case 'both':
        if (!response.trim() && (!fileData || !fileData.url)) {
          return {
            isValid: false,
            message: "Please provide either a text response or upload a file (or both)."
          };
        }
        if (fileData && !fileData.url) {
          return {
            isValid: false,
            message: "File upload appears to be incomplete. Please try uploading your file again."
          };
        }
        return { isValid: true, message: "" };
        
      default:
        return {
          isValid: false,
          message: "Please select a submission type."
        };
    }
  };
  
  // Fetch detailed task content and check for existing submissions when modal opens
  useEffect(() => {
    if (isOpen && task) {
      fetchTaskDetails();
      checkExistingSubmission();
    }
  }, [isOpen, task]);
  
  const checkExistingSubmission = async () => {
    if (!task || !userId) return;
    
    setIsCheckingExistingSubmission(true);
    
    try {
      const { data: existingSubmissionData, error } = await supabase
        .from('internship_task_submissions')
        .select('*')
        .eq('task_id', task.id)
        .eq('user_id', userId)
        .single();
      
      if (existingSubmissionData && !error) {
        setExistingSubmission(existingSubmissionData);
        setSubmissionId(existingSubmissionData.id);
        // If there's already a submission, we might want to show feedback or existing data
        if (existingSubmissionData.response_text) {
          setResponse(existingSubmissionData.response_text);
        }
        if (existingSubmissionData.file_url) {
          setFileData({
            url: existingSubmissionData.file_url,
            name: existingSubmissionData.file_name || 'Uploaded file',
            type: existingSubmissionData.file_type || 'application/octet-stream',
            size: existingSubmissionData.file_size || 0
          });
        }
      }
    } catch (error) {
      // No existing submission found, which is fine
      console.log('No existing submission found:', error);
    } finally {
      setIsCheckingExistingSubmission(false);
    }
  };
  
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
  
  // New simplified function to start feedback generation
  const startFeedbackGeneration = async (submissionId: string) => {
    try {
      // Log that we're starting feedback generation
      console.log("Starting feedback generation for submission:", submissionId);
      
      // Get session data needed for the Edge Function
      const { data: sessionData, error: sessionError } = await supabase
        .from("internship_sessions")
        .select("job_title, industry")
        .eq("id", task.session_id)
        .limit(1);
        
      if (sessionError) {
        console.error("Error fetching session data:", sessionError);
        throw new Error(`Failed to fetch session data: ${sessionError.message}`);
      }
      
      const sessionInfo = sessionData && sessionData.length > 0 ? sessionData[0] : null;
      if (!sessionInfo) {
        console.error("Session data not found for session_id:", task.session_id);
        throw new Error("Session data not found");
      }
      
      const jobTitle = sessionInfo.job_title || "Intern";
      const industry = sessionInfo.industry || "Technology";
      
      // Get user's current session for auth token
      const { data: authData } = await supabase.auth.getSession();
      const accessToken = authData?.session?.access_token;
      
      // Call the Edge Function to generate feedback
      console.log("Calling Edge Function to generate feedback");
      const { data: feedbackData, error: functionError } = await supabase.functions.invoke('generate-internship-feedback', {
        body: {
          submission_id: submissionId,
          task_id: task.id,
          submission_text: fileData 
            ? `${response}\n\nFile Submission: ${fileData.name} (${fileData.url})` 
            : response,
          task_description: task.description,
          task_instructions: taskDetails?.instructions || task.instructions,
          job_title: jobTitle,
          industry: industry
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (functionError) {
        console.error("Error generating AI feedback:", functionError);
        throw new Error(`Failed to generate feedback: ${JSON.stringify(functionError)}`);
      }
      
      console.log("Feedback generation triggered successfully:", feedbackData);
      
      // Start polling for feedback
      await checkForFeedback(submissionId);
      
    } catch (error) {
      console.error("Error in feedback generation:", error);
      setFeedbackError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      setIsFeedbackLoading(false);
    }
  };
  
  // Updated handleSubmit function with proper validation for each submission type
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    // Validate submission based on type
    const validationResult = validateSubmissionData();
    if (!validationResult.isValid) {
      toast({
        title: "Submission Validation Failed",
        description: validationResult.message,
        variant: "destructive"
      });
      return;
    }
    
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
    setFeedbackError(null);
    
    try {
      // Log the data being submitted
      console.log("Submitting task with data:", {
        session_id: task.session_id,
        task_id: task.id,
        user_id: userId,
        response_text: response ? "Text provided" : "No text",
        file_url: fileData?.url || null,
        file_name: fileData?.name || null,
        file_type: fileData?.type || null,
        file_size: fileData?.size || null,
        content_type: submissionType,
        is_update: !!existingSubmission
      });
      
      // First, check if the user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error("User validation error:", userError);
        throw new Error(`User validation failed: ${userError.message}`);
      }
      
      console.log("User validation successful, user exists:", userData);
      
      // Prepare submission data
      const submissionData = {
        task_id: task.id,
        user_id: userId,
        response_text: response || '',
        file_url: fileData?.url || null,
        file_name: fileData?.name || null,
        file_type: fileData?.type || null,
        file_size: fileData?.size || null,
        content_type: submissionType,
        session_id: task.session_id
      };
      
      let newSubmissionId: string;
      
      // Use upsert to handle both new submissions and updates to existing ones
      if (existingSubmission) {
        // Update existing submission
        const { data: updateData, error: updateError } = await supabase
          .from('internship_task_submissions')
          .update(submissionData)
          .eq('id', existingSubmission.id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        newSubmissionId = updateData.id;
      } else {
        // Create new submission
        const { data: insertData, error: insertError } = await supabase
          .from('internship_task_submissions')
          .insert([submissionData])
          .select()
          .single();
          
        if (insertError) throw insertError;
        newSubmissionId = insertData.id;
      }
      
      if (!newSubmissionId) {
        throw new Error("Failed to get submission ID");
      }
      
      // Store the submission ID for future reference
      setSubmissionId(newSubmissionId);
      
      // Update task status to completed
      const { error: updateError } = await supabase
        .from("internship_tasks")
        .update({ status: "completed" })
        .eq("id", task.id);
      
      if (updateError) throw updateError;
      
      // Show success state
      setShowSuccess(true);
      setIsSubmitting(false);
      
      // Start feedback generation process
      console.log("=== STARTING FEEDBACK GENERATION ===");
      setIsFeedbackLoading(true);
      
      // Use the simplified feedback generation function
      await startFeedbackGeneration(newSubmissionId);
      
      // Notify parent component
      onSubmissionComplete?.(true);
      
    } catch (error) {
      console.error("Error submitting task:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was an error submitting your task. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setIsFeedbackLoading(false);
    }
  };
  
  // Function to poll for feedback
  const checkForFeedback = async (submissionId: string, attempts = 0) => {
    if (attempts > 30) { // Give up after 30 attempts (5 minutes at 10-second intervals)
      setFeedbackError("Feedback generation is taking longer than expected. Please check back later.");
      return;
    }
    
    try {
      // Define types for our database responses
      type SubmissionData = {
        quality_rating: number | null;
        timeliness_rating: number | null;
        collaboration_rating: number | null;
        overall_assessment: string | null;
        feedback_provided_at: string | null;
      };
      
      type FeedbackData = {
        specific_comments: string | null;
        generation_status: string | null;
      };

      // First check the main submissions table for ratings
      const { data: submissionData, error: submissionError } = await supabase
        .from("internship_task_submissions")
        .select("quality_rating, timeliness_rating, collaboration_rating, overall_assessment, feedback_provided_at")
        .eq("id", submissionId)
        .single();
        
      if (submissionError) throw submissionError;
      
      // Then check for detailed feedback text in the feedback_details table
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("internship_feedback_details")
        .select("specific_comments, generation_status")
        .eq("submission_id", submissionId)
        .single();
      
      // Log what we're getting from the database to help with debugging
      console.log("Feedback polling - submission data:", submissionData);
      console.log("Feedback polling - feedback data:", feedbackData);
      
      // Safely cast the data to our types
      const typedSubmissionData = submissionData as SubmissionData;
      const typedFeedbackData = feedbackData as FeedbackData | null;
      
      // Properly type the submission data to avoid TypeScript errors
      if (typedSubmissionData) {
        // Case 1: We have complete feedback with ratings and text
        if (
          typedSubmissionData.quality_rating && 
          typedFeedbackData?.specific_comments
        ) {
          // Feedback is fully available
          setFeedback({
            feedback_text: typedFeedbackData.specific_comments,
            quality_rating: typedSubmissionData.quality_rating || 0,
            timeliness_rating: typedSubmissionData.timeliness_rating || 0,
            collaboration_rating: typedSubmissionData.collaboration_rating || 0,
            overall_assessment: typedSubmissionData.overall_assessment || "Pending",
            feedback_provided_at: typedSubmissionData.feedback_provided_at || new Date().toISOString()
          });
          return;
        }
        
        // Case 2: We have feedback in submission but quality rating is available
        if (typedSubmissionData.quality_rating) {
          // We have ratings but not detailed text, create a fallback feedback
          setFeedback({
            feedback_text: "Your submission has been reviewed. Detailed feedback will be available shortly.",
            quality_rating: typedSubmissionData.quality_rating || 0,
            timeliness_rating: typedSubmissionData.timeliness_rating || 0,
            collaboration_rating: typedSubmissionData.collaboration_rating || 0,
            overall_assessment: typedSubmissionData.overall_assessment || "Pending",
            feedback_provided_at: typedSubmissionData.feedback_provided_at || new Date().toISOString()
          });
          return;
        }
      }
      
      // Case 3: After 10 attempts (100 seconds), give the option to view feedback later
      if (attempts >= 10) {
        setFeedbackError(
          "Feedback generation is still in progress. You can close this dialog and check your feedback in the dashboard later."
        );
        return;
      }
      
      // Wait 10 seconds before trying again
      await new Promise(resolve => setTimeout(resolve, 10000));
      await checkForFeedback(submissionId, attempts + 1);
      
    } catch (error) {
      console.error("Error checking for feedback:", error);
      setFeedbackError("Error retrieving feedback. Please check back later in the dashboard feedback tab.");
    }
  };
  
  const handleCloseAndReset = () => {
    onClose();
    
    // If we have feedback or feedback is taking too long, redirect to dashboard feedback tab
    if (feedback || feedbackError) {
      // Navigate to the dashboard feedback tab
      // This assumes you have a way to navigate or set the active tab in the parent component
      onSubmissionComplete?.(true); // Pass true to indicate we should show the feedback tab
    }
    
    // Reset state after modal is closed
    setTimeout(() => {
      setResponse("");
      setShowSuccess(false);
      setActiveTab("overview");
      setFeedback(null);
      setFeedbackError(null);
      setIsFeedbackLoading(false);
      setSubmissionId(null);
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
  
  // Helper function to render rating
  const renderRating = (label: string, rating: number) => {
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{label}</span>
          <div className="flex items-center">
            <span className="text-sm font-bold mr-1">{rating}/10</span>
            <Star className="h-4 w-4 text-amber-500" fill={rating > 5 ? "currentColor" : "none"} />
          </div>
        </div>
        <Progress value={rating * 10} className="h-2" />
      </div>
    );
  };
  
  if (!task) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseAndReset}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          feedback ? (
            // Feedback view
            <div className="py-4">
              <DialogHeader>
                <DialogTitle className="text-xl mb-2">Your Feedback</DialogTitle>
                <DialogDescription>
                  Here's the feedback for your task submission
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Performance Ratings</CardTitle>
                      <Badge className={`${
                        feedback.overall_assessment === 'Excellent' ? 'bg-green-100 text-green-800' :
                        feedback.overall_assessment === 'Good' ? 'bg-blue-100 text-blue-800' :
                        feedback.overall_assessment === 'Satisfactory' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {feedback.overall_assessment}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderRating("Quality", feedback.quality_rating)}
                    {renderRating("Timeliness", feedback.timeliness_rating)}
                    {renderRating("Collaboration", feedback.collaboration_rating)}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-line">{feedback.feedback_text}</div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-4 text-right">
                      Feedback provided on {format(new Date(feedback.feedback_provided_at), "MMMM d, yyyy")}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <DialogFooter className="mt-6">
                <Button onClick={handleCloseAndReset}>Return to Dashboard</Button>
              </DialogFooter>
            </div>
          ) : isFeedbackLoading ? (
            // Loading feedback view
            <div className="py-6 flex flex-col items-center text-center">
              <div className="mb-4">
                <LoadingSpinner size="large" />
              </div>
              <DialogTitle className="text-xl mb-2">Generating Feedback...</DialogTitle>
              <DialogDescription className="mb-6">
                We're analyzing your submission and generating personalized feedback. This may take a minute or two.
              </DialogDescription>
            </div>
          ) : feedbackError ? (
            // Error view
            <div className="py-6 flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <DialogTitle className="text-xl mb-2">Feedback Generation Error</DialogTitle>
              <DialogDescription className="mb-6">
                {feedbackError}
              </DialogDescription>
              <Button onClick={handleCloseAndReset}>Return to Dashboard</Button>
            </div>
          ) : (
            // Success view (while waiting for feedback to start)
            <div className="py-6 flex flex-col items-center text-center">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <DialogTitle className="text-xl mb-2">Task Submitted Successfully!</DialogTitle>
              <DialogDescription className="mb-6">
                Your work has been submitted. Preparing to generate feedback...
              </DialogDescription>
            </div>
          )
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
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">{resource.title}</h5>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {resource.description}
                                  </p>
                                  {resource.search_guidance && (
                                    <div className="mt-2 p-2 bg-blue-50 rounded-md border-l-2 border-blue-200">
                                      <p className="text-xs text-blue-800 font-medium">
                                        💡 How to find this resource:
                                      </p>
                                      <p className="text-xs text-blue-700 mt-1">
                                        {resource.search_guidance}
                                      </p>
                                    </div>
                                  )}
                                  {resource.website && (
                                    <a 
                                      href={resource.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary mt-2 inline-flex items-center gap-1 hover:underline"
                                    >
                                      Visit Website
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                  {/* Backward compatibility for old format */}
                                  {resource.url && !resource.website && (
                                    <a 
                                      href={resource.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary mt-2 inline-flex items-center gap-1 hover:underline"
                                    >
                                      Open Resource
                                      <ExternalLink className="h-3 w-3" />
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
                    {isCheckingExistingSubmission ? (
                      <div className="py-8 flex justify-center">
                        <LoadingSpinner size="default" />
                        <span className="ml-2 text-sm text-muted-foreground">Checking existing submission...</span>
                      </div>
                    ) : existingSubmission ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                            <h4 className="font-medium text-blue-900">Existing Submission Found</h4>
                          </div>
                          <p className="text-sm text-blue-800 mb-3">
                            You have already submitted this task. You can update your submission below if needed.
                          </p>
                          <div className="text-xs text-blue-700">
                            Originally submitted: {format(new Date(existingSubmission.created_at), "MMMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                        
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

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCloseAndReset} disabled={isSubmitting}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSubmit} 
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <LoadingSpinner size="small" />
                              ) : existingSubmission ? (
                                "Update Submission"
                              ) : (
                                "Submit Task"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
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

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={handleCloseAndReset} disabled={isSubmitting}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <LoadingSpinner size="small" />
                            ) : existingSubmission ? (
                              "Update Submission"
                            ) : (
                              "Submit Task"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
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