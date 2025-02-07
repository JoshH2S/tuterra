
import { useState } from "react";
import { useTutorMaterials } from "@/hooks/useTutorMaterials";
import { useTutorMessages } from "@/hooks/useTutorMessages";
import { TutorChatHeader } from "./TutorChatHeader";
import { TutorChatMessages } from "./TutorChatMessages";
import { TutorChatInput } from "./TutorChatInput";

interface TutorChatProps {
  courseId?: string;
}

export const TutorChat = ({ courseId }: TutorChatProps) => {
  const [message, setMessage] = useState("");
  const { materials, selectedMaterial, setSelectedMaterial } = useTutorMaterials(courseId);
  const { messages, isLoading, sendMessage } = useTutorMessages(courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(message, selectedMaterial);
    setMessage("");
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
