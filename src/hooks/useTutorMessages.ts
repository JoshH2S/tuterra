
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "./useConversation";
import { useMessageTransform } from "./useMessageTransform";
import { Subscription } from "./useSubscription";

export const useTutorMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { conversationId, setConversationId } = useConversation();
  const { transformMessages } = useMessageTransform();
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

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
      setMessages(prev => [
        ...prev,
        {
          id: tempUserMessageId,
          content: message,
          role: 'user'
        }
      ]);

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

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('tutor_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (messagesData) {
        setMessages(transformMessages(messagesData));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error fetching messages",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
