
import { TutorChat } from "@/components/tutor/TutorChat";
import { AITutorChat } from "@/components/tutor/AITutorChat";
import { SplineSceneBasic } from "@/components/ui/code.demo";
import { Toaster } from "@/components/ui/toaster";

const CourseTutor = () => {
  return (
    <>
      <Toaster />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <SplineSceneBasic />
          <AITutorChat />
        </div>
      </div>
    </>
  );
};

export default CourseTutor;

