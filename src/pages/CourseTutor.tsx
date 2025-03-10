
import { TutorInterface } from "@/components/ai-tutor/TutorInterface";
import { Toaster } from "@/components/ui/toaster";

const CourseTutor = () => {
  return (
    <>
      <Toaster />
      <div className="container mx-auto py-4 px-2 sm:py-6 sm:px-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          <TutorInterface />
        </div>
      </div>
    </>
  );
};

export default CourseTutor;
