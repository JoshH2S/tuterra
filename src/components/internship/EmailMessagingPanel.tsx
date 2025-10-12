import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Mail, 
  MailOpen, 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  Forward,
  MoreVertical,
  Send,
  User,
  Clock
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { AISupervisorService } from "@/services/aiSupervisor";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailMessage {
  id: string;
  subject: string;
  content: string;
  sender_name: string;
  sender_role?: string;
  sender_department?: string;
  sender_type: 'user' | 'supervisor' | 'system';
  direction: 'outbound' | 'inbound';
  created_at: string;
  sent_at?: string;
  is_read: boolean;
  message_type?: string;
  thread_id?: string;
}

interface EmailMessagingPanelProps {
  sessionId: string;
}

export function EmailMessagingPanel({ sessionId }: EmailMessagingPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'inbox' | 'message' | 'compose'>('inbox');
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [sending, setSending] = useState(false);

  // Compose email state
  const [composeContent, setComposeContent] = useState("");
  
  // Task context state
  const [selectedTaskId, setSelectedTaskId] = useState<string>("general");
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  
  // Polling interval ref
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const supervisorMessages = await AISupervisorService.getSupervisorMessages(sessionId, user.id);
      
      // Convert to unified email format
      const emailMessages: EmailMessage[] = supervisorMessages.map(msg => {
          const senderPersona = (msg as any).sender_persona;
        const senderName = msg.sender_type === 'user' ? 'You' : (senderPersona?.name || 'Sarah Mitchell');
          const senderRole = senderPersona?.role || 'Internship Coordinator';
          
          return {
            id: msg.id,
          subject: msg.subject || generateSubjectFromType(msg.message_type),
          content: msg.message_content,
            sender_name: senderName,
          sender_role: msg.sender_type === 'supervisor' ? senderRole : undefined,
          sender_department: senderPersona?.department,
          sender_type: msg.sender_type,
          direction: msg.direction,
          created_at: msg.sent_at || new Date().toISOString(),
            sent_at: msg.sent_at,
          is_read: msg.is_read,
            message_type: msg.message_type,
          thread_id: (msg as any).thread_id
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setMessages(emailMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error loading messages",
        description: "Failed to load your messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [sessionId, user, toast]);

  // Polling setup (MVP: 15-30s polling instead of realtime)
  useEffect(() => {
    if (sessionId && user) {
      loadMessages();
      
      // Poll every 20 seconds
      pollingInterval.current = setInterval(() => {
        loadMessages();
      }, 20000);

      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [sessionId, user, loadMessages]);

  // Load available tasks for context dropdown
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;
      
      const { data: tasks } = await supabase
        .from('internship_tasks')
        .select('id, title, status, due_date')
        .eq('session_id', sessionId)
        .neq('status', 'completed')
        .order('due_date', { ascending: true });
      
      setAvailableTasks(tasks || []);
    };
    
    if (sessionId && user) {
      loadTasks();
    }
  }, [sessionId, user]);

  // Helper to calculate days until due
  const daysUntil = (dateIso: string): number => {
    const due = new Date(dateIso).getTime();
    const now = Date.now();
    return Math.ceil((due - now) / 86_400_000);
  };

  const generateSubjectFromType = (messageType?: string): string => {
    switch (messageType) {
      case 'onboarding': return '🌟 Welcome to Your Virtual Internship!';
      case 'check_in': return '📝 Check-in: How are things going?';
      case 'feedback_followup': return '💬 Feedback on Your Recent Submission';
      case 'reminder': return '⏰ Reminder: Upcoming Task Deadline';
      case 'encouragement': return '🎉 Great Progress Update!';
      case 'milestone': return '🏆 Milestone Achievement!';
      default: return 'Message from Internship Coordinator';
    }
  };

  const handleMessageClick = async (message: EmailMessage) => {
    setSelectedMessage(message);
    setView('message');
    setIsReplying(false);
    setReplyText("");

    // Mark as read if it's an unread outbound message (from supervisor to user)
    if (!message.is_read && message.direction === 'outbound') {
      await AISupervisorService.markMessageRead(message.id);
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, is_read: true } : msg
        )
      );
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim() || !user || sending) return;

    setSending(true);
    try {
      const replySubject = selectedMessage.subject.startsWith('Re:') 
        ? selectedMessage.subject 
        : `Re: ${selectedMessage.subject}`;

      await AISupervisorService.sendUserReply(
        sessionId,
        user.id,
        replySubject,
        replyText.trim(),
        selectedMessage.thread_id || selectedMessage.id,
        selectedTaskId === "general" ? undefined : selectedTaskId || undefined
      );

      setReplyText("");
      setIsReplying(false);
      setSelectedTaskId("general");
      
      // Wait for AI response, then reload
      setTimeout(() => {
        loadMessages();
      }, 2000);

      toast({
        title: "Reply sent",
        description: "Your reply has been sent. Sarah will respond shortly!",
      });
      
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error sending reply",
        description: "Failed to send your reply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleCompose = async () => {
    if (!selectedTaskId || !composeContent.trim() || !user || sending) return;

    setSending(true);
    try {
      // Generate subject from selected task
      const subject = selectedTaskId === "general" 
        ? "General Question" 
        : availableTasks.find(t => t.id === selectedTaskId)?.title || "Question about task";

      await AISupervisorService.sendUserReply(
        sessionId,
        user.id,
        subject,
        composeContent.trim(),
        undefined,
        selectedTaskId === "general" ? undefined : selectedTaskId
      );

      setComposeContent("");
      setSelectedTaskId("general");
      setView('inbox');
      
      // Wait for AI response, then reload
      setTimeout(() => {
        loadMessages();
      }, 2000);

      toast({
        title: "Message sent",
        description: "Your message has been sent. Sarah will respond shortly!",
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getAvatarColor = (senderType: string, senderName: string) => {
    if (senderType === 'user') {
      return 'bg-primary text-primary-foreground';
    } else {
      // Consistent colors for supervisors/team members
      const colors = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-amber-100 text-amber-700',
        'bg-pink-100 text-pink-700',
        'bg-indigo-100 text-indigo-700'
      ];
      const index = senderName.length % colors.length;
      return colors[index];
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.is_read && m.direction === 'outbound').length;

  // Inbox View
  if (view === 'inbox') {
    return (
      <Card className="h-[700px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Inbox
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView('compose')}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Compose
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner size="default" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm font-medium">No messages found</p>
              <p className="text-xs">
                {searchQuery ? "Try a different search term" : "Your supervisor will reach out soon!"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="divide-y">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !message.is_read && message.direction === 'outbound' ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className={getAvatarColor(message.sender_type, message.sender_name)}>
                          {message.sender_type === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            getInitials(message.sender_name)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${!message.is_read && message.direction === 'outbound' ? 'font-bold' : ''}`}>
                              {message.sender_name}
                            </span>
                            {message.sender_role && (
                              <span className="text-xs text-muted-foreground">
                                • {message.sender_role}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(message.created_at)}
                            </span>
                            {!message.is_read && message.direction === 'outbound' ? (
                              <MailOpen className="h-4 w-4 text-primary" />
                            ) : (
                              <Mail className="h-4 w-4 text-muted-foreground/50" />
                            )}
                          </div>
                        </div>
                        
                        <div className={`text-sm mt-1 ${!message.is_read && message.direction === 'outbound' ? 'font-semibold' : ''}`}>
                          {message.subject}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {message.content.length > 100 
                            ? `${message.content.substring(0, 100)}...`
                            : message.content
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  }

  // Message View
  if (view === 'message' && selectedMessage) {
    return (
      <Card className="h-[700px] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('inbox')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inbox
            </Button>
            
            <div className="flex-1" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  Star
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Message Header */}
          <div className="pb-4 border-b flex-shrink-0">
            <h1 className="text-xl font-semibold mb-3">{selectedMessage.subject}</h1>
            
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className={getAvatarColor(selectedMessage.sender_type, selectedMessage.sender_name)}>
                  {selectedMessage.sender_type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    getInitials(selectedMessage.sender_name)
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedMessage.sender_name}</span>
                  {selectedMessage.sender_role && (
                    <Badge variant="outline" className="text-xs">
                      {selectedMessage.sender_role}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedMessage.sender_department && `${selectedMessage.sender_department} • `}
                  {format(new Date(selectedMessage.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                </div>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-h-0 py-4">
            <ScrollArea className="h-full w-full">
              <div className="pr-4">
                <div className="whitespace-pre-wrap text-sm leading-6 break-words">
                  {selectedMessage.content}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Reply Section */}
          <div className="border-t pt-4 flex-shrink-0">
            {!isReplying ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsReplying(true)}
                  className="gap-2"
                  size="sm"
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Forward className="h-4 w-4" />
                  Forward
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  Reply to: {selectedMessage.sender_name}
                </div>
                
                {/* Task Context Dropdown */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Related Task (Optional)</label>
                  <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a task for context..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Question</SelectItem>
                      {availableTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          <div className="flex items-center gap-2">
                            {task.title}
                            {daysUntil(task.due_date) <= 3 && (
                              <Clock className="h-3 w-3 text-orange-500" />
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[100px] max-h-[200px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleReply}
                    disabled={!replyText.trim() || sending}
                    className="gap-2"
                    size="sm"
                  >
                    {sending ? <LoadingSpinner size="small" /> : <Send className="h-4 w-4" />}
                    Send Reply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyText("");
                      setSelectedTaskId("general");
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compose View
  if (view === 'compose') {
    return (
      <Card className="h-[700px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('inbox')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inbox
            </Button>
            <CardTitle className="text-lg">Compose Message</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Subject/Related Task Dropdown */}
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a task or general question..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Question</SelectItem>
                {availableTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    <div className="flex items-center gap-2">
                      {task.title}
                      {daysUntil(task.due_date) <= 3 && (
                        <Clock className="h-3 w-3 text-orange-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Help Sarah provide better guidance by linking your question to a specific task
            </p>
          </div>
          
          <div className="flex-1 flex flex-col">
            <label className="text-sm font-medium mb-2">Message</label>
            <Textarea
              placeholder="Type your message..."
              value={composeContent}
              onChange={(e) => setComposeContent(e.target.value)}
              className="flex-1 min-h-[300px]"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCompose}
              disabled={!selectedTaskId || !composeContent.trim() || sending}
              className="gap-2"
            >
              {sending ? <LoadingSpinner size="small" /> : <Send className="h-4 w-4" />}
              Send Message
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setComposeContent("");
                setSelectedTaskId("general");
                setView('inbox');
              }}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
} 