
import { Outlet } from "react-router-dom";
import { MainSidebar } from "./MainSidebar";
import { Toaster } from "sonner";
import { Footer } from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "./mobile/MobileHeader";
import { CourseTip } from "@/components/onboarding/CourseTip";

export const MainLayout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <MainSidebar />
      <div className="flex-1 flex flex-col">
        {isMobile && <MobileHeader />}
        <main className="flex-1 container mx-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster />
      <CourseTip />
    </div>
  );
};
