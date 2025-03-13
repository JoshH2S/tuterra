
import { TutorInterface } from "@/components/ai-tutor/TutorInterface";
import { Toaster } from "@/components/ui/toaster";

const CourseTutor = () => {
  return (
    <>
      <Toaster />
      <div className="h-screen w-full overflow-hidden">
        <div className="relative h-full z-10">
          <TutorInterface />
        </div>
      </div>
    </>
  );
};

export default CourseTutor;
