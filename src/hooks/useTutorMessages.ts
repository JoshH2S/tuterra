import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export const useTutorMessages = (courseId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user || !courseId) return;

        const { data: conversationData } = await supabase
          .from('tutor_conversations')
          .select('id')
          .eq('student_id', userData.user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (conversationData) {
          setConversationId(conversationData.id);
          const { data: messagesData } = await supabase
            .from('tutor_messages')
            .select('*')
            .eq('conversation_id', conversationData.id)
            .order('created_at', { ascending: true });

          if (messagesData) {
            setMessages(messagesData);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (courseId) {
      fetchMessages();
    }
  }, [courseId]);

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
      
      const { data: messagesData } = await supabase
        .from('tutor_messages')
        .select('*')
        .eq('conversation_id', response.data.conversationId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
        setConversationId(response.data.conversationId);
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