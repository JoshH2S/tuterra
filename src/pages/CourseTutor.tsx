
import { TutorChat } from "@/components/tutor/TutorChat";
import { SplineSceneBasic } from "@/components/ui/code.demo";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "@/hooks/use-mobile";

const CourseTutor = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <Toaster />
      <div className={`container mx-auto ${isMobile ? 'py-4 px-2' : 'py-8 px-4'}`}>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className={`w-full ${isMobile ? 'h-[200px]' : 'h-[300px]'}`}>
            <SplineSceneBasic />
          </div>
          <TutorChat />
        </div>
      </div>
    </>
  );
};

export default CourseTutor;
