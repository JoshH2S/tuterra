
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
      <div className="h-screen w-full overflow-hidden">
        {showSpline ? (
          <div className="absolute top-0 left-0 w-full h-1/3 z-0">
            <SplineSceneBasic />
          </div>
        ) : null}
        <div className="relative h-full z-10">
          <TutorInterface onConversationStart={handleConversationStart} />
        </div>
      </div>
    </>
  );
};

export default CourseTutor;
