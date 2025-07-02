import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Clock, CheckCircle2 } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AISupervisorService } from "@/services/aiSupervisor";
import { LoadingSpinner } from "@/components/ui/loading-states";

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'supervisor' | 'system';
  sender_name?: string;
  sender_role?: string;
  sender_department?: string;
  sender_avatar_style?: string;
  created_at: string;
  message_type?: string;
  context_data?: any;
}

interface EnhancedMessagingPanelProps {
  sessionId: string;
}

export function EnhancedMessagingPanel({ sessionId }: EnhancedMessagingPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId && user) {
      loadMessages();
      
      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel('internship_messages')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'internship_supervisor_messages',
            filter: `session_id=eq.${sessionId}`
          },
          () => {
            loadMessages();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [sessionId, user]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get supervisor messages (including team member messages)
      const supervisorMessages = await AISupervisorService.getSupervisorMessages(sessionId, user.id);
      
      // Get regular messages using the correct schema
      const { data: regularMessages } = await supabase
        .from('internship_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      // Combine and sort messages - handle the actual message structure
      const allMessages: Message[] = [
        ...(supervisorMessages || []).map((msg: any) => ({
          id: msg.id,
          content: msg.message_content,
          sender_type: 'supervisor' as const,
          sender_name: msg.sender_persona?.name || 'Sarah Mitchell',
          sender_role: msg.sender_persona?.role || 'Internship Coordinator',
          sender_department: msg.sender_persona?.department || 'Human Resources',
          sender_avatar_style: msg.sender_persona?.avatar_style || 'professional',
          created_at: msg.sent_at || msg.scheduled_for || msg.created_at,
          message_type: msg.message_type,
          context_data: msg.context_data
        })),
        ...(regularMessages || []).map(msg => ({
          id: msg.id,
          content: msg.body || msg.content || '',
          sender_type: msg.sender_name === 'You' ? 'user' as const : 'supervisor' as const,
          sender_name: msg.sender_name || 'Unknown',
          created_at: msg.sent_at || msg.timestamp
        }))
      ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setMessages(allMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      // Get user name for the message
      const { data: userData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const userName = userData ? `${userData.first_name} ${userData.last_name}` : 'You';

      // Save user message using the correct schema
      const { error } = await supabase
        .from('internship_messages')
        .insert({
          session_id: sessionId,
          sender: 'user',
          sender_name: userName,
          sender_avatar_url: user.user_metadata?.avatar_url || '',
          subject: 'Message from intern',
          content: newMessage.trim(),
          body: newMessage.trim(),
          timestamp: new Date().toISOString(),
          sent_at: new Date().toISOString(),
          is_read: false
        });

      if (error) throw error;

      // Record interaction
      await AISupervisorService.recordInteraction(
        sessionId,
        user.id,
        'user_message_sent',
        { message_content: newMessage.trim() }
      );

      setNewMessage("");
      await loadMessages();

      // Optional: Trigger AI response after user message
      // This could be enhanced to have more sophisticated conversation logic
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const getMessageTypeIcon = (messageType?: string) => {
    switch (messageType) {
      case 'onboarding':
        return '👋';
      case 'check_in':
        return '📝';
      case 'feedback_followup':
        return '💭';
      case 'reminder':
        return '⏰';
      case 'encouragement':
        return '🎉';
      default:
        return null;
    }
  };

  const getMessageTypeBadge = (messageType?: string) => {
    switch (messageType) {
      case 'onboarding':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Welcome</Badge>;
      case 'check_in':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Check-in</Badge>;
      case 'feedback_followup':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Feedback</Badge>;
      case 'reminder':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Reminder</Badge>;
      case 'encouragement':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Milestone</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-8">
          <LoadingSpinner size="default" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Messages with Sarah Mitchell
          <Badge variant="outline" className="ml-auto">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs">Your supervisor will reach out soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isUser = message.sender_type === 'user';
                const showAvatar = index === 0 || messages[index - 1].sender_type !== message.sender_type;
                
                return (
                  <div key={message.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                    {showAvatar ? (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {isUser ? (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 flex-shrink-0" />
                    )}
                    
                    <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                      {showAvatar && (
                        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs font-medium text-muted-foreground">
                            {message.sender_name}
                          </span>
                          {message.message_type && getMessageTypeBadge(message.message_type)}
                        </div>
                      )}
                      
                      <div className={`
                        rounded-lg px-3 py-2 max-w-full
                        ${isUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted border'
                        }
                      `}>
                        <div className="flex items-start gap-2">
                          {!isUser && message.message_type && (
                            <span className="text-sm">
                              {getMessageTypeIcon(message.message_type)}
                            </span>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      
                      <span className="text-xs text-muted-foreground mt-1">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                className="pr-12"
              />
              {sending && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="small" />
                </div>
              )}
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Sarah typically responds within a few hours</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
