
import { TutorChat } from "@/components/tutor/TutorChat";
import { SplineSceneBasic } from "@/components/ui/code.demo";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TutorSidebar } from "@/components/tutor/TutorSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const CourseTutor = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TutorSidebar />
        <main className="flex-1">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50"
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
      <Toaster />
    </SidebarProvider>
  );
};

export default CourseTutor;
