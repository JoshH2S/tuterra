import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { InternshipTask } from "./SwipeableInternshipView";
import { InternshipSession } from "@/pages/VirtualInternshipDashboard";
import { FeedbackViewer } from "./FeedbackViewer";
import { useAuth } from "@/hooks/useAuth";

interface SubmissionWithTask {
  id: string;
  task_id: string;
  response_text: string;
  created_at: string;
  feedback_text: string | null;
  feedback_provided_at: string | null;
  quality_rating: number | null;
  timeliness_rating: number | null;
  collaboration_rating: number | null;
  overall_assessment: string | null;
  task: {
    title: string;
    description: string;
    status: string;
  };
}

interface FeedbackCenterProps {
  sessionData: InternshipSession;
  tasks: InternshipTask[];
}

export function FeedbackCenter({ sessionData, tasks }: FeedbackCenterProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<SubmissionWithTask[]>([]);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user || !sessionData.id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("internship_task_submissions")
          .select(`
            *,
            task:internship_tasks(title, description, status)
          `)
          .eq("session_id", sessionData.id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        const typedData = data as unknown as SubmissionWithTask[];
        setSubmissions(typedData);
        
        // Set the first submission as active if there is one
        if (typedData.length > 0) {
          setActiveSubmissionId(typedData[0].id);
        }
        
      } catch (error) {
        console.error("Error fetching task submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [sessionData.id, user]);
  
  const getSubmissionStatus = (submission: SubmissionWithTask) => {
    if (submission.feedback_text) {
      return {
        label: "Feedback Received",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    } else {
      return {
        label: "Awaiting Feedback",
        color: "bg-amber-100 text-amber-800 border-amber-200"
      };
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="default" />
      </div>
    );
  }
  
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">No Submissions Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Complete and submit tasks from the Tasks tab to receive mentor feedback here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Submissions list - left sidebar */}
      <div className="md:col-span-1">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Your Submissions</CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {submissions.map((submission) => {
                const status = getSubmissionStatus(submission);
                
                return (
                  <button
                    key={submission.id}
                    onClick={() => setActiveSubmissionId(submission.id)}
                    className={`w-full text-left p-3 border-b last:border-b-0 transition hover:bg-muted/40 ${
                      activeSubmissionId === submission.id ? "bg-muted/60" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm truncate pr-2">{submission.task.title}</h4>
                      <Badge className={status.color} variant="outline">
                        {status.label}
                      </Badge>
          </div>
                    <div className="text-xs text-muted-foreground">
                      Submitted: {format(new Date(submission.created_at), "MMM d, yyyy")}
        </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
            </div>
            
      {/* Feedback display - right side */}
      <div className="md:col-span-2">
        {activeSubmissionId ? (
          <div className="space-y-4">
            <Tabs defaultValue="feedback">
              <TabsList>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="submission">Your Submission</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feedback" className="mt-4">
                <FeedbackViewer 
                  submissionId={activeSubmissionId} 
                  taskId={submissions.find(s => s.id === activeSubmissionId)?.task_id || ""}
                />
              </TabsContent>
              
              <TabsContent value="submission" className="mt-4">
                <Card>
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-base font-medium">
                      {submissions.find(s => s.id === activeSubmissionId)?.task.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="whitespace-pre-line">
                      {submissions.find(s => s.id === activeSubmissionId)?.response_text}
              </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Select a submission to view feedback
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
