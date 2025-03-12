
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "./MainSidebar";
import { MobileNavigation } from "./mobile/MobileNavigation";
import { MobileHeader } from "./mobile/MobileHeader";
import { DesktopHeader } from "./desktop/DesktopHeader";
import { Footer } from "./Footer";
import { AppRoutes } from "@/routes/AppRoutes";
import { useCustomFont } from "@/hooks/useCustomFont";
import { useIsMobile } from "@/hooks/use-mobile";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { SkipToContent } from "@/components/ui/skip-to-content";

export const MainLayout = () => {
  useCustomFont();
  useKeyboardNavigation();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        <div className="min-h-screen flex flex-col w-full">
          <SkipToContent />
          <div className="flex flex-1">
            <MainSidebar />
            <div className="flex-1 flex flex-col">
              {isMobile ? <MobileHeader /> : <DesktopHeader />}
              <main id="main-content" className={`flex-1 ${isMobile ? 'px-4 py-4 pb-24' : 'px-8 py-8'} overflow-x-hidden`}>
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </div>
          {isMobile && <MobileNavigation />}
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
