
import { useState } from "react";
import { useTutorMaterials } from "@/hooks/useTutorMaterials";
import { useTutorMessages } from "@/hooks/useTutorMessages";
import { TutorChatHeader } from "./TutorChatHeader";
import { TutorChatMessages } from "./TutorChatMessages";
import { TutorChatInput } from "./TutorChatInput";
import { processFileContent } from "@/utils/file-utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TutorChatProps {
  courseId?: string;
}

export const TutorChat = ({ courseId }: TutorChatProps) => {
  const [message, setMessage] = useState("");
  const { materials, selectedMaterial, setSelectedMaterial } = useTutorMaterials(courseId);
  const { messages, isLoading, sendMessage } = useTutorMessages(courseId);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(message, selectedMaterial);
    setMessage("");
  };

  const handleFileUpload = async (file: File) => {
    try {
      const processedContent = await processFileContent(file);
      
      // Upload to Supabase Storage
      const filePath = `${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('tutor_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Send a message with the file context
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
        description: error.message,
        variant: "destructive",
      });
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
      <div className="p-4 border-t">
        <TutorChatInput
          message={message}
          isLoading={isLoading}
          onMessageChange={setMessage}
          onSubmit={handleSubmit}
          onFileUpload={handleFileUpload}
        />
      </div>
    </div>
  );
};
