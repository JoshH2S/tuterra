import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calendar, 
  Download, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  MapPin
} from "lucide-react";
import { 
  getUserTimezone, 
  formatInUserTimezone, 
  formatDeadlineWithContext,
  getRelativeDeadlineText,
  createCalendarEventUrl,
  downloadTaskDeadlineAsICS,
  calculateBusinessDeadline
} from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";

export function DeadlineDemo() {
  const { toast } = useToast();
  const userTimezone = getUserTimezone();
  
  // Sample deadlines for demonstration
  const sampleDeadlines = [
    {
      id: '1',
      title: 'Complete Market Research Report',
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      description: 'Analyze competitor landscape and market trends'
    },
    {
      id: '2', 
      title: 'Submit Weekly Progress Update',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
      description: 'Weekly status report with accomplishments and challenges'
    },
    {
      id: '3',
      title: 'Client Presentation Preparation',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      description: 'Prepare slides and practice presentation for client meeting'
    },
    {
      id: '4',
      title: 'Overdue Task Example',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (overdue)
      description: 'This demonstrates how overdue tasks are displayed'
    }
  ];

  const handleAddToCalendar = (deadline: typeof sampleDeadlines[0], provider: 'google' | 'outlook' | 'apple') => {
    try {
      const calendarUrl = createCalendarEventUrl(
        `📋 Task Deadline: ${deadline.title}`,
        deadline.dueDate,
        undefined,
        deadline.description,
        'Virtual Internship Platform',
        provider
      );

      if (provider === 'apple') {
        downloadTaskDeadlineAsICS(deadline.title, deadline.dueDate, deadline.description);
        toast({
          title: "Calendar Event Downloaded",
          description: "ICS file downloaded. Open it to add to your calendar.",
        });
      } else {
        window.open(calendarUrl, '_blank');
        toast({
          title: "Calendar Opened",
          description: `Opening ${provider} Calendar...`,
        });
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to create calendar event.",
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
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
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const nextBusinessDeadline = calculateBusinessDeadline(7);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Enhanced Deadline System Demo
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {userTimezone}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          This demonstrates the new timezone-aware deadline system with live calendar integration.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Time Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Current Time (Your Timezone)</div>
              <div className="text-lg">{formatInUserTimezone(new Date().toISOString(), 'EEEE, MMMM d, yyyy \'at\' h:mm:ss a')}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Next Business Deadline</div>
              <div className="text-lg">{formatInUserTimezone(nextBusinessDeadline.toISOString(), 'EEEE, MMMM d \'at\' h:mm a')}</div>
            </div>
          </div>
        </div>

        {/* Sample Deadlines */}
        <div className="space-y-4">
          <h3 className="font-semibold">Sample Task Deadlines</h3>
          {sampleDeadlines.map((deadline) => {
            const deadlineInfo = formatDeadlineWithContext(deadline.dueDate);
            
            return (
              <div key={deadline.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getUrgencyIcon(deadlineInfo.urgency)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{deadline.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {deadline.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={`${getUrgencyColor(deadlineInfo.urgency)} text-xs`}>
                          {deadlineInfo.relativeText}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {deadlineInfo.fullDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddToCalendar(deadline, 'google')}
                      className="gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Google
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddToCalendar(deadline, 'outlook')}
                      className="gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Outlook
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddToCalendar(deadline, 'apple')}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      ICS
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">✅ Fixed Issues</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Timezone-aware deadline checking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Live calendar integration (Google, Outlook, Apple)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Real-time relative deadline text</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Business hours deadline calculation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Proper UTC storage with local display</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">🚀 New Features</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>One-click calendar sync</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Urgency-based color coding</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-blue-500" />
                <span>ICS file generation</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-500" />
                <span>Deep calendar app links</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>Automatic timezone detection</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
} 