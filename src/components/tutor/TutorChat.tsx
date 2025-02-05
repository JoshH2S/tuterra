import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TutorMessage } from "./TutorMessage";

interface TutorChatProps {
  courseId: string;
}

export const TutorChat = ({ courseId }: TutorChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        },
      });

      if (response.error) throw response.error;

      setMessage("");
      
      // Fetch updated messages
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
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">AI Study Assistant</h2>
        <p className="text-sm text-gray-600">
          Ask me to create study guides, generate quizzes, build study schedules, or explain any topic you're struggling with.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <TutorMessage
            key={msg.id}
            content={msg.content}
            role={msg.role}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[60px]"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};