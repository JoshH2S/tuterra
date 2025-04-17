
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

interface LayoutProps {
  children: React.ReactNode;
  isLandingPage?: boolean;
}

export const Layout = ({ children, isLandingPage = false }: LayoutProps) => {
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <SkipToContent />
      <div className="flex flex-1 w-full">
        {!isLandingPage && <MainSidebar />}
        <div 
          className="flex-1 flex flex-col transition-all duration-300 ease-in-out bg-white w-full"
          style={{ 
            marginLeft: isMobile || isLandingPage ? 0 : "200px"  // No margin on landing page
          }}
        >
          {!isLandingPage && (isMobile ? <MobileHeader /> : <DesktopHeader />)}
          <main id="main-content" className={`flex-1 ${isMobile && !isLandingPage ? 'px-4 py-4 pb-24' : (!isLandingPage ? 'p-6' : 'p-0')} overflow-x-hidden w-full`}>
            {children}
          </main>
          <Footer />
        </div>
      </div>
      {isMobile && !isLandingPage && <MobileNavigation />}
    </div>
  );
}
