
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addMonths, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar-new';
import { Loader2, Calendar as CalendarIcon, CheckCircle, Clock, AlertCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Task type definition
type Task = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'not_started' | 'submitted' | 'feedback_given';
  task_type: string;
  task_order: number;
  instructions: string;
};

// Session type definition
type InternshipSession = {
  id: string;
  job_title: string;
  industry: string;
  user_id: string;
  created_at: string;
  current_phase: number;
};

// Deliverable type definition
type Deliverable = {
  id: string;
  task_id: string;
  content: string;
  submitted_at: string;
};

// Feedback type definition
type Feedback = {
  id: string;
  deliverable_id: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
};

const InternshipPhase3 = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<InternshipSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [deliverables, setDeliverables] = useState<Record<string, Deliverable>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback>>({});
  const [calendarDates, setCalendarDates] = useState<{ start: Date, end: Date } | null>(null);

  // Load session data
  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionData = async () => {
      try {
        setLoading(true);
        const { data: sessionData, error: sessionError } = await supabase
          .from('internship_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        if (!sessionData) throw new Error('Session not found');

        setSession(sessionData);

        // Set calendar range based on session created_at
        const startDate = new Date(sessionData.created_at);
        const endDate = addMonths(startDate, 2);
        setCalendarDates({ start: startDate, end: endDate });

        // Fetch tasks for this session
        const { data: tasksData, error: tasksError } = await supabase
          .from('internship_tasks')
          .select('*')
          .eq('session_id', sessionId)
          .order('task_order', { ascending: true });

        if (tasksError) throw tasksError;

        // If no tasks exist, generate them
        if (!tasksData || tasksData.length === 0) {
          await generateTasks(sessionData);
        } else {
          // Convert the status string to the appropriate type
          const typedTasks = tasksData.map(task => ({
            ...task,
            status: task.status as 'not_started' | 'submitted' | 'feedback_given'
          }));
          
          setTasks(typedTasks);
          await fetchDeliverables(tasksData.map(t => t.id));
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load internship data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  // Generate tasks using the edge function
  const generateTasks = async (sessionData: InternshipSession) => {
    try {
      const response = await fetch(`https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-internship-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        },
        body: JSON.stringify({
          job_title: sessionData.job_title,
          industry: sessionData.industry,
          session_id: sessionId
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate tasks');
      }

      // Ensure tasks have the correct status type
      const typedTasks = result.tasks.map((task: any) => ({
        ...task,
        status: task.status as 'not_started' | 'submitted' | 'feedback_given'
      }));
      
      setTasks(typedTasks);
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate internship tasks. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Fetch deliverables and feedback for tasks
  const fetchDeliverables = async (taskIds: string[]) => {
    if (!taskIds.length) return;

    try {
      // Fetch deliverables
      const { data: deliverablesData, error: deliverablesError } = await supabase
        .from('internship_deliverables')
        .select('*')
        .in('task_id', taskIds);

      if (deliverablesError) throw deliverablesError;

      // Create a map of task_id to deliverable
      const deliverablesMap: Record<string, Deliverable> = {};
      const deliverableIds: string[] = [];

      if (deliverablesData) {
        deliverablesData.forEach(deliverable => {
          deliverablesMap[deliverable.task_id] = deliverable;
          deliverableIds.push(deliverable.id);
        });
        setDeliverables(deliverablesMap);
      }

      // If we have deliverables, fetch feedback
      if (deliverableIds.length) {
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('internship_feedback')
          .select('*')
          .in('deliverable_id', deliverableIds);

        if (feedbackError) throw feedbackError;

        // Create a map of deliverable_id to feedback
        const feedbackMap: Record<string, Feedback> = {};
        if (feedbackData) {
          feedbackData.forEach(feedback => {
            feedbackMap[feedback.deliverable_id] = feedback;
          });
          setFeedbacks(feedbackMap);
        }
      }
    } catch (error) {
      console.error('Error fetching deliverables and feedback:', error);
    }
  };

  // Handle task selection
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setSubmissionText('');
    
    // If task has already been submitted, populate with previous submission
    const deliverable = deliverables[task.id];
    if (deliverable) {
      setSubmissionText(deliverable.content);
    }
    
    setTaskDialogOpen(true);
  };

  // Handle task submission
  const handleSubmitTask = async () => {
    if (!selectedTask || !sessionId || !session) return;

    try {
      setSubmitting(true);

      // 1. Insert the deliverable
      const { data: deliverableData, error: deliverableError } = await supabase
        .from('internship_deliverables')
        .insert({
          task_id: selectedTask.id,
          user_id: session.user_id,
          content: submissionText
        })
        .select()
        .single();

      if (deliverableError) throw deliverableError;

      // 2. Update the task status
      const { error: taskUpdateError } = await supabase
        .from('internship_tasks')
        .update({ status: 'submitted' })
        .eq('id', selectedTask.id);

      if (taskUpdateError) throw taskUpdateError;

      // 3. Generate feedback using the edge function
      const response = await fetch(`https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-internship-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        },
        body: JSON.stringify({
          task_id: selectedTask.id,
          deliverable_id: deliverableData.id,
          submission: submissionText,
          job_title: session.job_title,
          industry: session.industry
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate feedback');
      }

      // 4. Update local state
      setDeliverables({
        ...deliverables,
        [selectedTask.id]: deliverableData
      });

      setFeedbacks({
        ...feedbacks,
        [deliverableData.id]: result.feedback[0]
      });

      // 5. Update the tasks list with new status
      setTasks(tasks.map(task => 
        task.id === selectedTask.id ? { ...task, status: 'feedback_given' as const } : task
      ));

      // 6. Show success message and close dialog
      toast({
        title: 'Task Submitted',
        description: 'Your work has been submitted and feedback is available.',
      });

      // Close the task dialog and show feedback
      setTaskDialogOpen(false);
      setCurrentFeedback(result.feedback[0]);
      setFeedbackDialogOpen(true);

    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // View feedback for a task
  const handleViewFeedback = (task: Task) => {
    const deliverable = deliverables[task.id];
    if (deliverable) {
      const feedback = feedbacks[deliverable.id];
      if (feedback) {
        setCurrentFeedback(feedback);
        setFeedbackDialogOpen(true);
      }
    }
  };

  // Complete internship
  const handleCompleteInternship = async () => {
    if (!sessionId) return;

    try {
      // Check if all tasks have feedback
      const allTasksComplete = tasks.every(task => task.status === 'feedback_given');
      
      if (!allTasksComplete) {
        toast({
          title: 'Incomplete Tasks',
          description: 'Please complete all tasks before finishing the internship.',
          variant: 'warning',
        });
        return;
      }

      // Update session phase
      await supabase
        .from('internship_sessions')
        .update({ current_phase: 4 })
        .eq('id', sessionId);

      // Insert progress entry
      await supabase
        .from('internship_progress')
        .insert({
          user_id: session?.user_id,
          session_id: sessionId,
          phase_number: 3
        });

      toast({
        title: 'Congratulations!',
        description: 'You have successfully completed your virtual internship!',
      });

      // Redirect to completion page
      navigate(`/internship/completion/${sessionId}`);
    } catch (error) {
      console.error('Error completing internship:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete internship. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Determine tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = parseISO(task.due_date);
      return isEqual(
        new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())
      );
    });
  };

  // Render task status badge
  const renderTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Not Started</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">Submitted</Badge>;
      case 'feedback_given':
        return <Badge variant="outline" className="bg-green-100 text-green-700">Feedback Available</Badge>;
      default:
        return null;
    }
  };

  // Calculate progress stats
  const progressStats = {
    completed: tasks.filter(t => t.status === 'feedback_given').length,
    submitted: tasks.filter(t => t.status === 'submitted').length,
    notStarted: tasks.filter(t => t.status === 'not_started').length,
    total: tasks.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const tasksForSelectedDate = getTasksForDate(selectedDate);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{session?.job_title} Virtual Internship</h1>
        <p className="text-gray-600">Industry: {session?.industry}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar with stats */}
        <div className="order-2 lg:order-1">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Internship Progress</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Tasks Completed:</span>
                  <span className="font-semibold">{progressStats.completed} / {progressStats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Awaiting Feedback:</span>
                  <span className="font-semibold">{progressStats.submitted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Not Started:</span>
                  <span className="font-semibold">{progressStats.notStarted}</span>
                </div>
                
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600" 
                    style={{ width: `${(progressStats.completed / progressStats.total) * 100}%` }}
                  />
                </div>
                
                {progressStats.completed === progressStats.total ? (
                  <Button className="w-full mt-4" onClick={handleCompleteInternship}>
                    Complete Internship
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500 mt-4">
                    Complete all tasks to finish your internship.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Task Timeline</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.sort((a, b) => a.task_order - b.task_order).map((task) => (
                  <div 
                    key={task.id} 
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleTaskSelect(task)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      {renderTaskStatusBadge(task.status)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>{format(parseISO(task.due_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main calendar view */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Internship Calendar</h2>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  fromDate={calendarDates?.start}
                  toDate={calendarDates?.end}
                  modifiers={{
                    task: tasks.map(task => parseISO(task.due_date))
                  }}
                  modifiersStyles={{
                    task: { 
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      color: 'rgb(59, 130, 246)'
                    }
                  }}
                />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">
                  Tasks for {format(selectedDate, 'MMMM d, yyyy')}
                </h3>
                
                {tasksForSelectedDate.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks due on this date.</p>
                ) : (
                  <div className="space-y-4">
                    {tasksForSelectedDate.map(task => (
                      <Card key={task.id} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 py-3 px-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">{task.title}</h4>
                            {renderTaskStatusBadge(task.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="py-3 px-4">
                          <p className="text-gray-700 mb-3">{task.description}</p>
                          <div className="flex justify-end space-x-2">
                            {task.status === 'feedback_given' ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewFeedback(task)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                View Feedback
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleTaskSelect(task)}
                              >
                                {task.status === 'submitted' ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-2" />
                                    Awaiting Feedback
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Work
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription className="text-gray-600">
              Due {selectedTask?.due_date ? format(parseISO(selectedTask.due_date), 'MMMM d, yyyy') : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Task Description:</h3>
              <p>{selectedTask?.description}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Instructions:</h3>
              <p>{selectedTask?.instructions}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Message from your manager:</h4>
                  <p className="text-blue-800 mt-1 text-sm">
                    I'm looking forward to seeing your work on this task. Remember to follow the instructions and don't hesitate to be creative! This is your chance to demonstrate your skills.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Your Submission:</h3>
              <Textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter your work submission here..."
                className="min-h-[200px]"
                disabled={selectedTask?.status === 'submitted' || selectedTask?.status === 'feedback_given'}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            {selectedTask?.status === 'not_started' && (
              <Button 
                onClick={handleSubmitTask} 
                disabled={!submissionText.trim() || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Work
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback from Your Manager</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="feedback" className="mt-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="improvements">Areas to Improve</TabsTrigger>
            </TabsList>
            
            <TabsContent value="feedback" className="p-4 border rounded-lg bg-gray-50">
              <ScrollArea className="h-[300px] pr-4">
                <div className="whitespace-pre-wrap">
                  {currentFeedback?.feedback}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="strengths">
              <div className="space-y-2">
                {currentFeedback?.strengths.map((strength, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                      <p>{strength}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="improvements">
              <div className="space-y-2">
                {currentFeedback?.improvements.map((improvement, index) => (
                  <div key={index} className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                      <p>{improvement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button onClick={() => setFeedbackDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InternshipPhase3;
