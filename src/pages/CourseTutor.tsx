
import { TutorChat } from "@/components/tutor/TutorChat";
import { SplineSceneBasic } from "@/components/ui/code.demo";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TutorSidebar } from "@/components/tutor/TutorSidebar";

const CourseTutor = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TutorSidebar />
        <main className="flex-1">
          <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <SplineSceneBasic />
              <TutorChat />
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default CourseTutor;
