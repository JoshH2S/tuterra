
import { useState } from "react";
import { useTutorMessages } from "@/hooks/useTutorMessages";
import { TutorChatMessages } from "./TutorChatMessages";
import { TutorChatInput } from "./TutorChatInput";
import { processFileContent } from "@/utils/file-utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const TutorChat = () => {
  const [message, setMessage] = useState("");
  const { messages, isLoading, sendMessage } = useTutorMessages();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      await sendMessage(message);
      setMessage("");
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const processedContent = await processFileContent(file);
      
      const filePath = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('tutor_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const fileMessage = `I've uploaded a file named "${file.name}". Please analyze its contents and help me understand it better.`;
      await sendMessage(fileMessage, filePath);

      toast({
        title: "File uploaded successfully",
        description: "You can now ask questions about the file content.",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        await sendMessage(message);
        setMessage("");
      }
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Chat with your AI Study Assistant</CardTitle>
        <CardDescription>
          Ask me anything about your studies. I can help you understand concepts, create study guides, or answer any academic questions.
        </CardDescription>
      </CardHeader>
      <div className="flex flex-col h-[600px]">
        <TutorChatMessages messages={messages} />
        <div className="p-4 border-t">
          <TutorChatInput
            message={message}
            isLoading={isLoading}
            onMessageChange={setMessage}
            onSubmit={handleSubmit}
            onKeyPress={handleKeyPress}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </Card>
  );
};
