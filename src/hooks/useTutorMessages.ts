import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "./useConversation";
import { useMessageTransform } from "./useMessageTransform";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export const useTutorMessages = (courseId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { conversationId, setConversationId } = useConversation(courseId);
  const { transformMessages } = useMessageTransform();
  const { toast } = useToast();

  const fetchMessages = async (conversationId: string) => {
    const { data: messagesData } = await supabase
      .from('tutor_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesData) {
      setMessages(transformMessages(messagesData));
    }
  };

  const sendMessage = async (message: string, selectedMaterial: string | null) => {
    if (!message.trim() || isLoading || !courseId) return;

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await supabase.functions.invoke('ai-tutor', {
        body: {
          message,
          conversationId,
          courseId,
          studentId: session.user.id,
          materialPath: selectedMaterial,
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

  return {
    messages,
    isLoading,
    sendMessage,
  };
};