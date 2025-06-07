import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Clock,
  Send,
  Paperclip,
  User,
  Bot
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AISupervisorService } from "@/services/aiSupervisor";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmailMessage {
  id: string;
  subject: string;
  content: string;
  sender_name: string;
  sender_role?: string;
  sender_department?: string;
  sender_avatar_style?: string;
  sender_type: 'user' | 'supervisor' | 'system';
  created_at: string;
  sent_at?: string;
  is_read: boolean;
  is_starred?: boolean;
  message_type?: string;
  context_data?: any;
  attachments?: any[];
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
  const [composeSubject, setComposeSubject] = useState("");
  const [composeContent, setComposeContent] = useState("");
  
  // Ref to track last message load time to prevent unnecessary reloads
  const lastLoadTime = useRef<number>(0);
  const loadingRef = useRef<boolean>(false);
  const subscriptionRef = useRef<any>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());

  const loadMessages = useCallback(async () => {
    if (!user || loadingRef.current) return;
    
    setLoading(true);
    loadingRef.current = true;
    
    try {
      // Get supervisor messages (including team member messages)
      const supervisorMessages = await AISupervisorService.getSupervisorMessages(sessionId, user.id);
      
      // Get regular messages using the correct schema
      const { data: regularMessages } = await supabase
        .from('internship_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false });

      // Convert to email format with subjects
      const emailMessages: EmailMessage[] = [
        ...(supervisorMessages || []).map(msg => {
          // Extract sender persona from the message if available  
          const senderPersona = (msg as any).sender_persona;
          const senderName = senderPersona?.name || 'Sarah Mitchell';
          const senderRole = senderPersona?.role || 'Internship Coordinator';
          
          return {
            id: msg.id,
            subject: generateSubjectFromContent(msg.message_content, msg.message_type),
            content: formatSupervisorMessage(msg.message_content, senderName, senderRole),
            sender_name: senderName,
            sender_role: senderRole,
            sender_department: senderPersona?.department || 'Human Resources',
            sender_avatar_style: senderPersona?.avatar_style || 'professional',
            sender_type: 'supervisor' as const,
            created_at: msg.sent_at || msg.scheduled_for,
            sent_at: msg.sent_at,
            is_read: false, // Default unread for supervisor messages
            message_type: msg.message_type,
            context_data: msg.context_data
          };
        }),
        ...(regularMessages || []).map(msg => ({
          id: msg.id,
          subject: msg.subject || 'Message from Intern',
          content: msg.body || msg.content || '',
          sender_name: msg.sender_name || 'You',
          sender_type: msg.sender_name === 'You' ? 'user' as const : 'supervisor' as const,
          created_at: msg.timestamp || msg.sent_at,
          sent_at: msg.timestamp || msg.sent_at,
          is_read: msg.is_read || false
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
      loadingRef.current = false;
    }
  }, [sessionId, user, toast]);

  // Debounced load messages function
  const debouncedLoadMessages = useCallback(() => {
    const now = Date.now();
    // Prevent loading if we just loaded recently (within 2 seconds)
    if (now - lastLoadTime.current < 2000 || loadingRef.current) {
      return;
    }
    
    lastLoadTime.current = now;
    
    // Small delay to batch rapid calls
    setTimeout(() => {
      loadMessages();
    }, 100);
  }, [loadMessages]);

  useEffect(() => {
    if (sessionId && user) {
      loadMessages();
      
      // Clean up existing subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      // Set up real-time subscription for new messages with better filtering
      subscriptionRef.current = supabase
        .channel(`email_messages_${sessionId}_${Date.now()}`) // Unique channel name
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'internship_supervisor_messages',
            filter: `session_id=eq.${sessionId}`
          },
          (payload) => {
            console.log('New supervisor message received:', payload);
            
            // Check if we've already processed this message
            if (processedMessageIds.current.has(payload.new.id)) {
              console.log('Message already processed, skipping reload');
              return;
            }
            
            // Check if this message already exists in our local state
            const messageExists = messages.some(msg => msg.id === payload.new.id);
            if (messageExists) {
              console.log('Message already exists, skipping reload');
              processedMessageIds.current.add(payload.new.id);
              return;
            }
            
            // Only reload if this is actually a new message (sent in the last minute)
            const messageTime = payload.new.sent_at || payload.new.created_at || new Date().toISOString();
            const now = new Date();
            const timeDiff = now.getTime() - new Date(messageTime).getTime();
            
            console.log('Message time diff (ms):', timeDiff);
            
            // Only reload for truly new messages (less than 1 minute old)
            if (timeDiff < 60000 && timeDiff >= -5000) { // Allow 5 seconds of clock skew
              console.log('Loading new message - time diff acceptable');
              processedMessageIds.current.add(payload.new.id);
              debouncedLoadMessages();
              
              // Show notification for new messages
              toast({
                title: "New message received",
                description: `You have a new message from ${payload.new.sender_persona?.name || 'your supervisor'}`,
              });
            } else {
              console.log('Skipping message reload - too old or future message', { 
                timeDiff, 
                messageTime, 
                currentTime: now.toISOString() 
              });
              // Still add to processed set to avoid checking again
              processedMessageIds.current.add(payload.new.id);
            }
          }
        )
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public', 
            table: 'internship_messages',
            filter: `session_id=eq.${sessionId}`
          },
          (payload) => {
            console.log('New user message received:', payload);
            // Reload for new user messages (like replies)
            debouncedLoadMessages();
          }
        )
        .subscribe();

      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
      };
    }
  }, [sessionId, user, loadMessages, debouncedLoadMessages, toast]);

  const generateSubjectFromContent = (content: string, messageType?: string): string => {
    // Generate email-like subjects based on content and type
    const firstLine = content.split('\n')[0];
    const preview = firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;

    switch (messageType) {
      case 'onboarding':
        return '🌟 Welcome to Your Virtual Internship!';
      case 'check_in':
        return '📝 Check-in: How are things going?';
      case 'feedback_followup':
        return '💬 Feedback Follow-up';
      case 'reminder':
        return '⏰ Reminder: Upcoming Deadline';
      case 'encouragement':
        return '🎉 Great Progress Update!';
      case 'milestone':
        return '🏆 Milestone Achievement';
      default:
        if (preview.toLowerCase().includes('welcome')) {
          return '👋 Welcome Message';
        } else if (preview.toLowerCase().includes('task') || preview.toLowerCase().includes('assignment')) {
          return '📋 New Task Assignment';
        } else if (preview.toLowerCase().includes('deadline') || preview.toLowerCase().includes('due')) {
          return '⏰ Deadline Reminder';
        } else if (preview.toLowerCase().includes('feedback')) {
          return '💭 Feedback Available';
        } else if (preview.toLowerCase().includes('meeting')) {
          return '📅 Meeting Invitation';
        } else {
          return preview;
        }
    }
  };

  const formatSupervisorMessage = (content: string, senderName: string, senderRole: string): string => {
    // Add professional email formatting to supervisor messages
    if (!content.includes('Best regards') && !content.includes('Best,') && !content.includes('Sincerely')) {
      // Add professional closing if not already present
      const lines = content.trim().split('\n');
      const lastLine = lines[lines.length - 1].trim();
      
      // Check if it already has a professional ending
      const hasEnding = lastLine.toLowerCase().includes('regards') || 
                       lastLine.toLowerCase().includes('best') ||
                       lastLine.toLowerCase().includes('sincerely') ||
                       lastLine.endsWith(senderName);
      
      if (!hasEnding) {
        return `${content.trim()}\n\nBest regards,\n${senderName}\n${senderRole}`;
      }
    }
    
    return content;
  };

  const handleMessageClick = async (message: EmailMessage) => {
    setSelectedMessage(message);
    setView('message');
    setIsReplying(false);
    setReplyText("");

    // Mark as read if not already read
    if (!message.is_read && message.sender_type !== 'user') {
      await markAsRead(message.id);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      // Update in the appropriate table based on message source
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      if (message.sender_type === 'supervisor' && message.message_type) {
        // This is a supervisor message, update differently if needed
        // For now, we'll just update local state
      } else {
        // Regular message
        const { error } = await supabase
          .from("internship_messages")
          .update({ is_read: true })
          .eq("id", messageId);
          
        if (error) throw error;
      }
      
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

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim() || !user || sending) return;

    setSending(true);
    try {
      // Get user name for the message
      const { data: userData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const userName = userData ? `${userData.first_name} ${userData.last_name}` : 'You';

      // Create reply subject
      const replySubject = selectedMessage.subject.startsWith('Re:') 
        ? selectedMessage.subject 
        : `Re: ${selectedMessage.subject}`;

      // Save reply message
      const { error } = await supabase
        .from('internship_messages')
        .insert({
          session_id: sessionId,
          sender: 'user',
          sender_name: userName,
          sender_avatar_url: user.user_metadata?.avatar_url || '',
          subject: replySubject,
          content: replyText.trim(),
          body: replyText.trim(),
          timestamp: new Date().toISOString(),
          is_read: false
        });

      if (error) throw error;

      // Record interaction
      await AISupervisorService.recordInteraction(
        sessionId,
        user.id,
        'user_message_sent',
        { 
          message_content: replyText.trim(),
          reply_to: selectedMessage.id,
          original_subject: selectedMessage.subject
        }
      );

      setReplyText("");
      setIsReplying(false);
      await loadMessages();

      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
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
    if (!composeSubject.trim() || !composeContent.trim() || !user || sending) return;

    setSending(true);
    try {
      // Get user name for the message
      const { data: userData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const userName = userData ? `${userData.first_name} ${userData.last_name}` : 'You';

      // Save new message
      const { error } = await supabase
        .from('internship_messages')
        .insert({
          session_id: sessionId,
          sender: 'user',
          sender_name: userName,
          sender_avatar_url: user.user_metadata?.avatar_url || '',
          subject: composeSubject.trim(),
          content: composeContent.trim(),
          body: composeContent.trim(),
          timestamp: new Date().toISOString(),
          is_read: false
        });

      if (error) throw error;

      // Record interaction
      await AISupervisorService.recordInteraction(
        sessionId,
        user.id,
        'user_message_sent',
        { 
          message_content: composeContent.trim(),
          subject: composeSubject.trim(),
          type: 'new_message'
        }
      );

      setComposeSubject("");
      setComposeContent("");
      setView('inbox');
      await loadMessages();

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
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
      // Use consistent colors for team members based on their name
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

  const unreadCount = messages.filter(m => !m.is_read && m.sender_type !== 'user').length;

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
                      !message.is_read && message.sender_type !== 'user' ? 'bg-primary/5 border-l-4 border-l-primary' : ''
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
                            <span className={`text-sm font-medium ${!message.is_read && message.sender_type !== 'user' ? 'font-bold' : ''}`}>
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
                            {!message.is_read && message.sender_type !== 'user' ? (
                              <MailOpen className="h-4 w-4 text-primary" />
                            ) : (
                              <Mail className="h-4 w-4 text-muted-foreground/50" />
                            )}
                          </div>
                        </div>
                        
                        <div className={`text-sm mt-1 ${!message.is_read && message.sender_type !== 'user' ? 'font-semibold' : ''}`}>
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

          {/* Message Content - Fixed height with proper scrolling */}
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
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input
              placeholder="Enter subject..."
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              className="mt-1"
            />
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
              disabled={!composeSubject.trim() || !composeContent.trim() || sending}
              className="gap-2"
            >
              {sending ? <LoadingSpinner size="small" /> : <Send className="h-4 w-4" />}
              Send Message
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setComposeSubject("");
                setComposeContent("");
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