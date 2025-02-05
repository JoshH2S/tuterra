import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TutorChatHeader } from "./TutorChatHeader";
import { TutorChatMessages } from "./TutorChatMessages";
import { TutorChatInput } from "./TutorChatInput";

interface TutorChatProps {
  courseId: string;
}

interface CourseMaterial {
  id: string;
  file_name: string;
  storage_path: string;
}

export const TutorChat = ({ courseId }: TutorChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const { data, error } = await supabase
          .from('course_materials')
          .select('id, file_name, storage_path')
          .eq('course_id', courseId);

        if (error) throw error;
        if (data) setMaterials(data);
      } catch (error) {
        console.error('Error fetching materials:', error);
        toast({
          title: "Error",
          description: "Failed to load course materials",
          variant: "destructive",
        });
      }
    };

    if (courseId) {
      fetchMaterials();
    }
  }, [courseId, toast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !courseId) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const response = await supabase.functions.invoke('ai-tutor', {
        body: {
          message,
          conversationId,
          courseId,
          studentId: user.id,
          materialPath: selectedMaterial,
        },
      });

      if (response.error) throw response.error;

      setMessage("");
      
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
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md">
      <TutorChatHeader
        materials={materials}
        selectedMaterial={selectedMaterial}
        onMaterialSelect={setSelectedMaterial}
      />
      <TutorChatMessages messages={messages} />
      <TutorChatInput
        message={message}
        isLoading={isLoading}
        onMessageChange={setMessage}
        onSubmit={handleSubmit}
      />
    </div>
  );
};