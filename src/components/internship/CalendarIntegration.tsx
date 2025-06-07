import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  Download, 
  ExternalLink, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Plus,
  ChevronDown,
  Smartphone,
  Monitor
} from "lucide-react";
import { InternshipTask } from "@/types/internship";
import { 
  createCalendarEventUrl, 
  downloadTaskDeadlineAsICS, 
  formatDeadlineWithContext,
  canIntegrateWithCalendar,
  getUserTimezone,
  formatInUserTimezone
} from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";

interface CalendarIntegrationProps {
  tasks: InternshipTask[];
  sessionData?: {
    job_title: string;
    industry: string;
  };
}

export function CalendarIntegration({ tasks, sessionData }: CalendarIntegrationProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InternshipTask | null>(null);
  const [calendarProvider, setCalendarProvider] = useState<'google' | 'outlook' | 'apple'>('google');

  const handleAddToCalendar = (task: InternshipTask, provider: 'google' | 'outlook' | 'apple') => {
    try {
      const title = `📋 ${sessionData?.job_title || 'Internship'}: ${task.title}`;
      const description = `Virtual Internship Task\n\nRole: ${sessionData?.job_title || 'Intern'}\nIndustry: ${sessionData?.industry || ''}\n\nTask Description:\n${task.description}\n\nDeadline: ${formatInUserTimezone(task.due_date)}\n\nComplete this task as part of your virtual internship experience.`;
      
      const calendarUrl = createCalendarEventUrl(
        title,
        task.due_date,
        undefined,
        description,
        'Virtual Internship Platform',
        provider
      );

      if (provider === 'apple') {
        // For Apple calendar, download the ICS file
        downloadTaskDeadlineAsICS(task.title, task.due_date, task.description);
        toast({
          title: "Calendar Event Created",
          description: "ICS file downloaded. Open it to add to your calendar.",
        });
      } else {
        // For Google and Outlook, open in new tab
        window.open(calendarUrl, '_blank');
        toast({
          title: "Calendar Event Created",
          description: `Opening ${provider} Calendar...`,
        });
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to create calendar event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDownload = () => {
    try {
      const pendingTasks = tasks.filter(task => task.status !== 'completed');
      
      if (pendingTasks.length === 0) {
        toast({
          title: "No Tasks to Export",
          description: "All tasks are completed. No deadlines to add to calendar.",
        });
        return;
      }

      pendingTasks.forEach(task => {
        setTimeout(() => {
          downloadTaskDeadlineAsICS(
            task.title, 
            task.due_date, 
            `${task.description}\n\nThis is part of your ${sessionData?.job_title || 'internship'} in ${sessionData?.industry || 'the assigned industry'}.`
          );
        }, 100); // Small delay between downloads
      });

      toast({
        title: "Calendar Events Generated",
        description: `Downloaded ${pendingTasks.length} task deadlines as calendar events.`,
      });
    } catch (error) {
      console.error('Error downloading bulk calendar events:', error);
      toast({
        title: "Error",
        description: "Failed to generate calendar events. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'urgent':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'soon':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const pendingTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const userTimezone = getUserTimezone();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Calendar Integration</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {userTimezone}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Sync your task deadlines with your personal calendar to stay organized.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add All Tasks
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkDownload()}>
                <Download className="h-4 w-4 mr-2" />
                Download ICS Files
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.open(
                  createCalendarEventUrl(
                    `🎯 Virtual Internship: ${sessionData?.job_title || 'General'}`,
                    new Date().toISOString(),
                    undefined,
                    `Your virtual internship program in ${sessionData?.industry || 'the assigned field'} with multiple task deadlines.`,
                    'Virtual Internship Platform',
                    'google'
                  ), 
                  '_blank'
                )}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Google Calendar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => window.open(
                  createCalendarEventUrl(
                    `🎯 Virtual Internship: ${sessionData?.job_title || 'General'}`,
                    new Date().toISOString(),
                    undefined,
                    `Your virtual internship program in ${sessionData?.industry || 'the assigned field'} with multiple task deadlines.`,
                    'Virtual Internship Platform',
                    'outlook'
                  ), 
                  '_blank'
                )}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Outlook Calendar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="secondary" 
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            View All Deadlines
          </Button>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{pendingTasks.length}</div>
            <div className="text-xs text-muted-foreground">Pending Tasks</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-xs text-muted-foreground">Completed Tasks</div>
          </div>
        </div>

        {/* Upcoming Deadlines Preview */}
        {pendingTasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Upcoming Deadlines</h4>
            {pendingTasks.slice(0, 3).map(task => {
              const deadlineInfo = formatDeadlineWithContext(task.due_date);
              return (
                <div key={task.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getUrgencyIcon(deadlineInfo.urgency)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{deadlineInfo.text}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAddToCalendar(task, 'google')}>
                        <Monitor className="h-4 w-4 mr-2" />
                        Google Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddToCalendar(task, 'outlook')}>
                        <Monitor className="h-4 w-4 mr-2" />
                        Outlook Calendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddToCalendar(task, 'apple')}>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Apple Calendar (ICS)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
            {pendingTasks.length > 3 && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setIsDialogOpen(true)}
                className="h-auto p-0 text-xs"
              >
                View {pendingTasks.length - 3} more...
              </Button>
            )}
          </div>
        )}

        {pendingTasks.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">All tasks completed!</p>
            <p className="text-xs text-muted-foreground">No upcoming deadlines to sync.</p>
          </div>
        )}
      </CardContent>

      {/* Full Deadlines Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>All Task Deadlines</DialogTitle>
            <DialogDescription>
              Add individual tasks to your calendar or download them all at once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Tasks ({pendingTasks.length})
                </h4>
                <div className="space-y-2">
                  {pendingTasks.map(task => {
                    const deadlineInfo = formatDeadlineWithContext(task.due_date);
                    return (
                      <div key={task.id} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1">
                          {getUrgencyIcon(deadlineInfo.urgency)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{task.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={`${getUrgencyColor(deadlineInfo.urgency)} text-xs`}>
                                {deadlineInfo.relativeText}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {deadlineInfo.fullDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-2">
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAddToCalendar(task, 'google')}>
                              Google Calendar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddToCalendar(task, 'outlook')}>
                              Outlook Calendar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddToCalendar(task, 'apple')}>
                              Apple Calendar (ICS)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Completed Tasks ({completedTasks.length})
                </h4>
                <div className="space-y-2">
                  {completedTasks.map(task => {
                    const deadlineInfo = formatDeadlineWithContext(task.due_date);
                    return (
                      <div key={task.id} className="flex items-start justify-between p-3 border rounded-lg bg-green-50/50 opacity-75">
                        <div className="flex items-start gap-3 flex-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-through">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Completed • {deadlineInfo.fullDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleBulkDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download All as ICS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 