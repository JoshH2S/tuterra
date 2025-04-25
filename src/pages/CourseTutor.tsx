
import { TutorInterface } from "@/components/ai-tutor/TutorInterface";
import { Toaster } from "@/components/ui/toaster";

const CourseTutor = () => {
  return (
    <>
      <Toaster />
      <div className="h-screen w-full">
        <div className="h-full">
          <TutorInterface />
        </div>
      </div>
    </>
  );
};

export default CourseTutor;
