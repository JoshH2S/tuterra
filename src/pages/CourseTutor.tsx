
import { TutorChat } from "@/components/tutor/TutorChat";
import { SplineSceneBasic } from "@/components/ui/code.demo";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { TutorSidebar } from "@/components/tutor/TutorSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

function TutorContent() {
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  return (
    <div className="min-h-screen flex w-full">
      <TutorSidebar />
      <main className="flex-1">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50"
            onClick={() => setOpenMobile(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <SplineSceneBasic />
            <TutorChat />
          </div>
        </div>
      </main>
    </div>
  );
}

const CourseTutor = () => {
  return (
    <SidebarProvider>
      <TutorContent />
      <Toaster />
    </SidebarProvider>
  );
};

export default CourseTutor;
