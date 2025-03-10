
import { useState } from "react";
import { TutorInterface } from "@/components/ai-tutor/TutorInterface";
import { Toaster } from "@/components/ui/toaster";
import { SplineSceneBasic } from "@/components/ui/code.demo";

const CourseTutor = () => {
  const [showSpline, setShowSpline] = useState(true);

  const handleConversationStart = () => {
    setShowSpline(false);
  };

  return (
    <>
      <Toaster />
      <div className="flex flex-col h-[100dvh] w-full overflow-hidden">
        {showSpline ? (
          <div className="absolute inset-0 z-0">
            <SplineSceneBasic />
          </div>
        ) : null}
        <div className="flex-1 relative z-10 w-full h-full">
          <TutorInterface onConversationStart={handleConversationStart} />
        </div>
      </div>
    </>
  );
};

export default CourseTutor;
