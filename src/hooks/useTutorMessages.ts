
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "./useConversation";
import { useMessageTransform } from "./useMessageTransform";

export const useTutorMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { conversationId, setConversationId } = useConversation();
  const { transformMessages } = useMessageTransform();
  const { toast } = useToast();

  // Fetch messages whenever the conversation ID changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  const sendMessage = async (message: string, materialPath?: string | null) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await supabase.functions.invoke('ai-tutor', {
        body: {
          message,
          conversationId,
          studentId: session.user.id,
          materialPath,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      
      if (response.data.conversationId) {
        setConversationId(response.data.conversationId);
        await fetchMessages(response.data.conversationId);
      }
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
    const { data: messagesData, error } = await supabase
      .from('tutor_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    if (messagesData) {
      setMessages(transformMessages(messagesData));
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
