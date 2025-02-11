
import { TutorChat } from "@/components/tutor/TutorChat";
import { SplineSceneBasic } from "@/components/ui/code.demo";

const CourseTutor = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <SplineSceneBasic />
        <TutorChat />
      </div>
    </div>
  );
};

export default CourseTutor;
