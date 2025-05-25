import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Paperclip, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface InternshipMessage {
  id: string;
  session_id: string;
  sender_name: string;
  sender_avatar_url: string | null;
  subject: string;
  body: string;
  related_task_id: string | null;
  related_task_title?: string | null;
  timestamp: string;
  is_read: boolean;
  created_at: string;
}

interface MessagingPanelProps {
  sessionId: string;
}

const WELCOME_MESSAGES: Partial<InternshipMessage>[] = [
  {
    id: "welcome-1",
    sender_name: "Jordan Miller",
    subject: "Welcome to Your Virtual Internship",
    body: "Hello and welcome to your virtual internship experience! I'm Jordan, your supervisor for this program. I'm excited to see what you'll accomplish during your time with us. Please take some time to explore the dashboard and get familiar with the available resources. Don't hesitate to reach out if you have any questions!",
    timestamp: new Date().toISOString(),
    is_read: false
  },
  {
    id: "welcome-2",
    sender_name: "Maya Chen",
    subject: "Getting Started with Our Team",
    body: "Hi there! Welcome to the team. I'm Maya from the Marketing department. We're thrilled to have you join us virtually. I wanted to let you know that I'm available to help if you have any questions about our marketing strategies or tools we use. Looking forward to seeing your contributions!",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    is_read: false
  },
  {
    id: "welcome-3",
    sender_name: "Alicia Rodriguez",
    subject: "HR Onboarding Information",
    body: "Welcome to your virtual internship! As your HR contact, I'm here to ensure you have a smooth experience. If you have any questions about policies, schedules, or need any other assistance, please don't hesitate to reach out. We're excited to have you on board!",
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    is_read: false
  }
];

export function MessagingPanel({ sessionId }: MessagingPanelProps) {
  const [messages, setMessages] = useState<InternshipMessage[]>([]);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (sessionId) {
      fetchMessages();
    }
  }, [sessionId]);
  
  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Fetch messages with a simple select
      const { data: messageData, error: messageError } = await supabase
        .from("internship_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false });
      
      if (messageError) throw messageError;
      
      let processedMessages = messageData || [];
      
      // Safely check for related task IDs and fetch task titles if they exist
      const taskIds = processedMessages
        .filter(m => m.related_task_id)
        .map(m => m.related_task_id)
        .filter(id => id); // Filter out null/undefined values
        
      if (taskIds.length > 0) {
        const { data: taskData, error: taskError } = await supabase
          .from("internship_tasks")
          .select("id, title")
          .in("id", taskIds);
          
        if (taskError) throw taskError;
        
        if (taskData) {
          // Add task titles to messages
          processedMessages = processedMessages.map(message => {
            if (message.related_task_id) {
              const relatedTask = taskData.find(task => task.id === message.related_task_id);
              return {
                ...message,
                related_task_title: relatedTask?.title || null
              };
            }
            return message;
          });
        }
      }
      
      // If any messages are in the old format (from old table structure), 
      // normalize them to the new format
      processedMessages = processedMessages.map(message => {
        // Cast to any to handle potential old structure fields
        const msg = message as any;
        return {
          id: msg.id,
          session_id: msg.session_id,
          sender_name: msg.sender_name || msg.sender || "Team Member",
          sender_avatar_url: msg.sender_avatar_url || null,
          subject: msg.subject || "No Subject",
          body: msg.body || msg.content || "",
          related_task_id: msg.related_task_id || null,
          related_task_title: msg.related_task_title || null,
          timestamp: msg.timestamp || msg.sent_at || msg.created_at,
          is_read: msg.is_read ?? false,
          created_at: msg.created_at || msg.timestamp || msg.sent_at || new Date().toISOString()
        } as InternshipMessage;
      });
      
      // If no messages exist, use welcome messages
      if (processedMessages.length === 0) {
        processedMessages = WELCOME_MESSAGES.map(msg => ({
          ...msg,
          session_id: sessionId,
          sender_avatar_url: null,
          related_task_id: null,
          related_task_title: null
        })) as InternshipMessage[];
      }
      
      setMessages(processedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error loading messages",
        description: "There was a problem loading your messages. Please try again.",
        variant: "destructive",
      });
      
      // Fall back to welcome messages on error
      setMessages(WELCOME_MESSAGES.map(msg => ({
        ...msg,
        session_id: sessionId,
        sender_avatar_url: null,
        related_task_id: null,
        related_task_title: null
      })) as InternshipMessage[]);
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (messageId: string) => {
    // Skip for welcome messages
    if (messageId.startsWith('welcome-')) return;
    
    try {
      const { error } = await supabase
        .from("internship_messages")
        .update({ is_read: true })
        .eq("id", messageId);
        
      if (error) throw error;
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };
  
  const toggleMessage = (messageId: string) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage(messageId);
      // Mark as read when expanded
      const message = messages.find(m => m.id === messageId);
      if (message && !message.is_read) {
        markAsRead(messageId);
      }
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };
  
  const formatRelativeTime = (dateString: string): string => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  const getInitials = (name: string): string => {
    return name.split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  const scrollToTask = (taskId: string) => {
    const taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) {
      taskElement.scrollIntoView({ behavior: 'smooth' });
      // Highlight the task briefly
      taskElement.classList.add('bg-primary/10');
      setTimeout(() => {
        taskElement.classList.remove('bg-primary/10');
      }, 2000);
    }
    // Close the expanded message
    setExpandedMessage(null);
  };

  return (
    <PremiumCard className="overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          {messages.length > 0 && (
            <div className="flex items-center gap-2">
              {messages.filter(m => !m.is_read).length > 0 && (
                <Badge variant="default" className="bg-primary text-white">
                  {messages.filter(m => !m.is_read).length} unread
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </span>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-6">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground text-sm mt-2">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">No messages available</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {messages.map((message) => (
              <button
                key={message.id}
                className={`w-full flex gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left touch-manipulation ${!message.is_read ? 'bg-primary/5' : ''}`}
                onClick={() => toggleMessage(message.id)}
              >
                <Avatar>
                  {message.sender_avatar_url ? (
                    <img src={message.sender_avatar_url} alt={message.sender_name} />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center rounded-full ${!message.is_read ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                      {getInitials(message.sender_name)}
                    </div>
                  )}
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h4 className={`text-sm truncate ${!message.is_read ? 'font-bold' : 'font-medium'}`}>
                      {message.sender_name}
                    </h4>
                    <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
                  </div>
                  <p className={`text-sm truncate ${!message.is_read ? 'font-bold' : 'font-medium'}`}>
                    {message.subject}
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-gray-500 truncate flex-1">
                      {message.body.substring(0, 60)}...
                    </p>
                    {!message.is_read && (
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                  
                  {message.related_task_id && message.related_task_title && (
                    <div className="mt-1 text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      <span className="truncate">📌 Refers to: {message.related_task_title}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
        
        <div className="flex justify-center">
          <Button 
            className="w-full gap-2" 
            variant="secondary"
            onClick={() => toast({
              title: "Inbox coming soon",
              description: "The full inbox functionality will be available in a future update.",
            })}
          >
            <MessageCircle className="h-4 w-4" />
            Go to Inbox
          </Button>
        </div>
        
        {/* Message modal for expanded view */}
        {expandedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setExpandedMessage(null)}>
            <div className="bg-card rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b">
                <h3 className="font-bold">{messages.find(m => m.id === expandedMessage)?.subject}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm">{messages.find(m => m.id === expandedMessage)?.sender_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {messages.find(m => m.id === expandedMessage)?.timestamp && 
                     formatRelativeTime(messages.find(m => m.id === expandedMessage)!.timestamp)}
                  </span>
                </div>
              </div>
              <div className="p-4 whitespace-pre-line">
                {messages.find(m => m.id === expandedMessage)?.body}
                
                {/* Task reference */}
                {messages.find(m => m.id === expandedMessage)?.related_task_id && 
                 messages.find(m => m.id === expandedMessage)?.related_task_title && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-2">📌 This message references a task:</p>
                    <p className="text-sm">{messages.find(m => m.id === expandedMessage)?.related_task_title}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        const taskId = messages.find(m => m.id === expandedMessage)?.related_task_id;
                        if (taskId) scrollToTask(taskId);
                      }}
                    >
                      View Task
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex justify-end">
                <Button variant="outline" onClick={() => setExpandedMessage(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat widget preview */}
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Quick Chat</h3>
            <span className="text-xs text-gray-500">Online</span>
          </div>
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <p className="text-center text-gray-500 text-xs">
              Need help? Start a chat with your supervisor
            </p>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
