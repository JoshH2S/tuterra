
import { Outlet } from "react-router-dom";
import { MainSidebar } from "./MainSidebar";
import { Toaster } from "sonner";
import { Footer } from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "./mobile/MobileHeader";

export const MainLayout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-[100dvh] w-full bg-background">
      <MainSidebar />
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {isMobile && <MobileHeader />}
        <main className="flex-1 container mx-auto p-4 md:p-6 relative">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster />
    </div>
  );
};
