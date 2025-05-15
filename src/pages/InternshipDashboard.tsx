import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, Clock, CheckCircle2, Briefcase, 
  Building2, Award, ArrowRight, Calendar, 
  FileText, MessageSquare
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

type InternshipSession = {
  id: string;
  job_title: string;
  industry: string;
  current_phase: number;
  created_at: string;
};

type TaskSummary = {
  completed: number;
  total: number;
};

type DeliverableSummary = {
  task_id: string;
  task_title: string;
  submitted_at: string;
  content: string;
  feedback?: {
    id: string;
    feedback: string;
    strengths: string[];
    improvements: string[];
    created_at: string;
  };
};

const InternshipDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSessions, setActiveSessions] = useState<InternshipSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<InternshipSession[]>([]);
  const [taskSummaries, setTaskSummaries] = useState<Record<string, TaskSummary>>({});
  const [selectedSession, setSelectedSession] = useState<InternshipSession | null>(null);
  const [deliverables, setDeliverables] = useState<DeliverableSummary[]>([]);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableSummary | null>(null);

  useEffect(() => {
    const fetchInternshipData = async () => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // Fetch active sessions (not completed)
        const { data: activeSessionsData, error: activeError } = await supabase
          .from('internship_sessions')
          .select('*')
          .eq('user_id', user.id)
          .lt('current_phase', 4)
          .order('created_at', { ascending: false });
        
        if (activeError) throw activeError;
        setActiveSessions(activeSessionsData || []);
        
        // Fetch completed sessions
        const { data: completedSessionsData, error: completedError } = await supabase
          .from('internship_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('current_phase', 4)
          .order('created_at', { ascending: false });
        
        if (completedError) throw completedError;
        setCompletedSessions(completedSessionsData || []);
        
        // Get task summaries for each session
        const allSessions = [...(activeSessionsData || []), ...(completedSessionsData || [])];
        const summaries: Record<string, TaskSummary> = {};
        
        for (const session of allSessions) {
          const { data: tasksData } = await supabase
            .from('internship_tasks')
            .select('id, status')
            .eq('session_id', session.id);
          
          if (tasksData) {
            summaries[session.id] = {
              completed: tasksData.filter(task => task.status === 'feedback_given').length,
              total: tasksData.length
            };
          }
        }
        
        setTaskSummaries(summaries);
      } catch (error) {
        console.error('Error fetching internship data:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchInternshipData();
  }, []);

  const fetchSessionDetails = async (session: InternshipSession) => {
    try {
      setSelectedSession(session);
      
      // Fetch deliverables and feedback for this session
      const { data: tasksData } = await supabase
        .from('internship_tasks')
        .select('id, title')
        .eq('session_id', session.id);
      
      if (!tasksData || tasksData.length === 0) return;
      
      const taskIds = tasksData.map(task => task.id);
      
      // Get deliverables for these tasks
      const { data: deliverablesData } = await supabase
        .from('internship_deliverables')
        .select('*')
        .in('task_id', taskIds);
      
      if (!deliverablesData) return;
      
      // For each deliverable, get its feedback and map to task
      const detailedDeliverables: DeliverableSummary[] = await Promise.all(
        deliverablesData.map(async (deliverable) => {
          const task = tasksData.find(t => t.id === deliverable.task_id);
          
          // Get feedback for this deliverable
          const { data: feedbackData } = await supabase
            .from('internship_feedback')
            .select('*')
            .eq('deliverable_id', deliverable.id)
            .single();
          
          return {
            task_id: deliverable.task_id,
            task_title: task?.title || 'Unknown Task',
            submitted_at: deliverable.submitted_at,
            content: deliverable.content,
            feedback: feedbackData || undefined
          };
        })
      );
      
      setDeliverables(detailedDeliverables);
    } catch (error) {
      console.error('Error fetching session details:', error);
    }
  };

  const resumeInternship = (session: InternshipSession) => {
    // Redirect to the appropriate phase based on current_phase
    if (session.current_phase === 1) {
      navigate(`/internship/start?session=${session.id}`);
    } else if (session.current_phase === 2) {
      navigate(`/internship/phase-2/${session.id}`);
    } else if (session.current_phase === 3) {
      navigate(`/internship/phase-3/${session.id}`);
    }
  };

  const viewCertificate = (session: InternshipSession) => {
    navigate(`/internship/completion/${session.id}`);
  };

  const viewFeedback = (deliverable: DeliverableSummary) => {
    setSelectedDeliverable(deliverable);
    setFeedbackDialogOpen(true);
  };

  const startNewInternship = () => {
    navigate('/internship/start');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Internship Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Internship Dashboard</h1>
        <Button onClick={startNewInternship}>Start New Internship</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Your Internships
              </CardTitle>
              <CardDescription>
                View and manage your virtual internship experiences
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <Tabs defaultValue="active">
                <TabsList className="w-full">
                  <TabsTrigger value="active" className="w-1/2">
                    Active ({activeSessions.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="w-1/2">
                    Completed ({completedSessions.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="mt-4 space-y-4">
                  {activeSessions.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No active internships</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={startNewInternship}
                      >
                        Start Your First Internship
                      </Button>
                    </div>
                  ) : (
                    activeSessions.map(session => (
                      <Card key={session.id} onClick={() => fetchSessionDetails(session)} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{session.job_title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Building2 className="h-3.5 w-3.5 mr-1" />
                                {session.industry}
                              </div>
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                Started {formatDistanceToNow(new Date(session.created_at))} ago
                              </div>
                            </div>
                            <Badge variant={
                              session.current_phase === 1 ? "outline" : 
                              session.current_phase === 2 ? "secondary" : 
                              "default"
                            }>
                              Phase {session.current_phase}
                            </Badge>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{taskSummaries[session.id]?.completed || 0}/{taskSummaries[session.id]?.total || 0} Tasks</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full" 
                                style={{ 
                                  width: `${taskSummaries[session.id] ? 
                                    (taskSummaries[session.id].completed / taskSummaries[session.id].total * 100) : 0}%`
                                }}
                              ></div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              resumeInternship(session);
                            }}
                          >
                            Continue Internship <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-4 space-y-4">
                  {completedSessions.length === 0 ? (
                    <p className="text-center py-6 text-muted-foreground">
                      Complete an internship to see it here
                    </p>
                  ) : (
                    completedSessions.map(session => (
                      <Card key={session.id} onClick={() => fetchSessionDetails(session)} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-semibold">{session.job_title}</h3>
                                <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Building2 className="h-3.5 w-3.5 mr-1" />
                                {session.industry}
                              </div>
                              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                Completed {format(new Date(session.created_at), 'MMM d, yyyy')}
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewCertificate(session);
                            }}
                          >
                            View Certificate <Award className="h-4 w-4 ml-1" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {selectedSession ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedSession.job_title}</CardTitle>
                <CardDescription className="flex justify-between items-center">
                  <span>{selectedSession.industry} Industry</span>
                  <Badge variant={selectedSession.current_phase >= 4 ? "secondary" : "outline"}>
                    {selectedSession.current_phase >= 4 ? "Completed" : `Phase ${selectedSession.current_phase}`}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="submissions">
                  <TabsList className="w-full">
                    <TabsTrigger value="submissions" className="w-1/2">
                      Your Submissions
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="w-1/2">
                      Feedback Received
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="submissions" className="mt-4">
                    {deliverables.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-muted-foreground">No submissions yet</p>
                        {selectedSession.current_phase < 4 && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => resumeInternship(selectedSession)}
                          >
                            Continue Your Internship
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {deliverables.map((deliverable, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex justify-between">
                                <h3 className="font-semibold">{deliverable.task_title}</h3>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(deliverable.submitted_at), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="mt-2 text-sm border-l-2 border-gray-200 pl-3 line-clamp-3">
                                {deliverable.content}
                              </div>
                              <div className="mt-4 flex justify-end">
                                {deliverable.feedback ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => viewFeedback(deliverable)}
                                    className="text-blue-600"
                                  >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    View Feedback
                                  </Button>
                                ) : (
                                  <Badge variant="outline">Pending Feedback</Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="feedback" className="mt-4">
                    {deliverables.filter(d => d.feedback).length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-muted-foreground">No feedback received yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {deliverables.filter(d => d.feedback).map((deliverable, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex justify-between">
                                <h3 className="font-semibold">{deliverable.task_title}</h3>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(deliverable.feedback?.created_at || ''), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="mt-2 text-sm border-l-2 border-green-200 pl-3 line-clamp-3">
                                {deliverable.feedback?.feedback}
                              </div>
                              
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <h4 className="text-xs font-medium text-green-700 mb-1">Strengths:</h4>
                                  <ul className="text-xs list-disc list-inside">
                                    {deliverable.feedback?.strengths.map((strength, i) => (
                                      <li key={i} className="text-gray-600">{strength}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-xs font-medium text-amber-700 mb-1">Areas to Improve:</h4>
                                  <ul className="text-xs list-disc list-inside">
                                    {deliverable.feedback?.improvements.map((improvement, i) => (
                                      <li key={i} className="text-gray-600">{improvement}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex justify-end">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => viewFeedback(deliverable)}
                                  className="text-blue-600"
                                >
                                  View Full Feedback
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end">
                {selectedSession.current_phase < 4 ? (
                  <Button onClick={() => resumeInternship(selectedSession)}>
                    <Play className="h-4 w-4 mr-1" />
                    Continue Internship
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => viewCertificate(selectedSession)}>
                    <Award className="h-4 w-4 mr-1" />
                    View Certificate
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center bg-gray-50 rounded-lg p-8 w-full">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Internship Selected</h3>
                <p className="text-muted-foreground mb-6">
                  Select an internship from the left to view its details, submissions, and feedback.
                </p>
                <Button onClick={startNewInternship}>Start New Internship</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback from Manager</DialogTitle>
            <DialogDescription>
              Task: {selectedDeliverable?.task_title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDeliverable?.feedback && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 p-1">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Your Submission:</h3>
                    <div className="text-sm bg-gray-50 p-3 rounded border">
                      {selectedDeliverable.content}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Manager's Feedback:</h3>
                    <div className="text-sm bg-blue-50 p-3 rounded border border-blue-100">
                      {selectedDeliverable.feedback.feedback}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Strengths:</h3>
                    <div className="space-y-2">
                      {selectedDeliverable.feedback.strengths.map((strength, i) => (
                        <div key={i} className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <p className="text-sm">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Areas to Improve:</h3>
                    <div className="space-y-2">
                      {selectedDeliverable.feedback.improvements.map((improvement, i) => (
                        <div key={i} className="flex items-start">
                          <ArrowRight className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                          <p className="text-sm">{improvement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InternshipDashboard;
