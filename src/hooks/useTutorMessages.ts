
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "./useConversation";
import { useMessageTransform } from "./useMessageTransform";
import { Subscription } from "./useSubscription";

export const useTutorMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  
  const { conversationId, setConversationId } = useConversation();
  const { transformMessages } = useMessageTransform();
  const { toast } = useToast();

  const fetchMessages = useCallback(async (convId: string, isLoadMore = false, newPage = 0) => {
    try {
      const start = newPage * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      
      // Only select necessary fields
      const { data: messagesData, error, count } = await supabase
        .from('tutor_messages')
        .select('id, role, content, created_at, conversation_id', { count: 'exact' })
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
        .range(start, end);

      if (error) throw error;

      // Check if there are more messages
      setHasMore(count ? count > (newPage + 1) * PAGE_SIZE : false);
      
      if (messagesData) {
        const transformedMessages = transformMessages(messagesData);
        
        if (isLoadMore) {
          setMessages(prevMessages => {
            // Use an object to track unique messages by ID
            const uniqueMessages = new Map();
            
            // Add existing messages
            prevMessages.forEach(msg => uniqueMessages.set(msg.id, msg));
            
            // Add new messages
            transformedMessages.forEach(msg => uniqueMessages.set(msg.id, msg));
            
            // Convert back to array and sort by timestamp
            return Array.from(uniqueMessages.values())
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          });
        } else {
          setMessages(transformedMessages);
        }
        
        setPage(newPage);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error fetching messages",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  }, [transformMessages, toast]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  const loadMoreMessages = () => {
    if (conversationId && !isLoading && hasMore) {
      fetchMessages(conversationId, true, page + 1);
    }
  };

  const sendMessage = async (
    message: string, 
    materialPath?: string | null,
    subscription?: Subscription
  ) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      // Add user message to UI immediately for better UX
      const tempUserMessageId = `temp-${Date.now()}`;
      const userMessage = {
        id: tempUserMessageId,
        content: message,
        role: 'user',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Debounce API call to prevent accidental double submissions
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await supabase.functions.invoke('ai-tutor', {
        body: {
          message,
          conversationId,
          studentId: session.user.id,
          materialPath,
          subscription: subscription ? {
            tier: subscription.tier,
            features: subscription.features
          } : {
            tier: "free",
            features: {
              smartNotes: false,
              advancedModel: false,
              learningPath: false,
              streaming: false
            }
          }
        },
      });

      if (response.error) throw response.error;
      
      if (response.data.conversationId) {
        setConversationId(response.data.conversationId);
        await fetchMessages(response.data.conversationId);
      }

      // Return additional data like smart notes
      return {
        smartNotes: response.data.smartNotes
      };
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    hasMore,
    loadMoreMessages
  };
};
