
import React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { MainSidebar } from "./MainSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavigation } from "./mobile/MobileNavigation";
import { MobileHeader } from "./mobile/MobileHeader";
import { DesktopHeader } from "./desktop/DesktopHeader";
import { Footer } from "./Footer";
import { SkipToContent } from "@/components/ui/skip-to-content";
import { Header1 } from "@/components/ui/header";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  isLandingPage?: boolean;
}

export const Layout = ({ children, isLandingPage = false }: LayoutProps) => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Hide sidebar and header on specific routes
  const hideSidebar = isLandingPage || 
                      location.pathname === "/about" || 
                      location.pathname === "/auth" ||
                      location.pathname === "/contact" ||
                      location.pathname === "/pricing";

  // Show Header1 on specific routes where the sidebar is hidden but we need navigation
  const showPublicHeader = location.pathname === "/about" || 
                          location.pathname === "/contact";

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <SkipToContent />
      {showPublicHeader && <Header1 />}
      
      <div className="flex flex-1 w-full">
        {!hideSidebar && <MainSidebar />}
        <div 
          className={cn(
            "flex-1 flex flex-col transition-all duration-300 ease-in-out bg-white w-full",
            !hideSidebar && !isMobile && "ml-[200px]"
          )}
        >
          {!hideSidebar && (isMobile ? <MobileHeader /> : <DesktopHeader />)}
          <main 
            id="main-content" 
            className={cn(
              "flex-1 w-full overflow-x-hidden",
              isMobile && !hideSidebar ? 'px-4 py-4 pb-24' : (!hideSidebar ? 'p-6' : 'p-0')
            )}
          >
            {children}
          </main>
          <Footer />
        </div>
      </div>
      {isMobile && !hideSidebar && <MobileNavigation />}
    </div>
  );
}
