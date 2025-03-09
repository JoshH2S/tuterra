
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
      <div className="container mx-auto py-4 px-2 sm:py-6 sm:px-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          {showSpline ? (
            <div className="mb-6">
              <SplineSceneBasic />
            </div>
          ) : null}
          <TutorInterface onConversationStart={handleConversationStart} />
        </div>
      </div>
    </>
  );
};

export default CourseTutor;
