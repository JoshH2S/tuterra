
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

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <SkipToContent />
      <div className="flex flex-1 w-full">
        <MainSidebar />
        <div 
          className="flex-1 flex flex-col transition-all duration-300 ease-in-out bg-white w-full"
          style={{ 
            marginLeft: isMobile ? 0 : isCollapsed ? "50px" : "200px" 
          }}
        >
          {isMobile ? <MobileHeader /> : <DesktopHeader />}
          <main id="main-content" className={`flex-1 ${isMobile ? 'px-4 py-4 pb-24' : 'p-6'} overflow-x-hidden w-full`}>
            {children}
          </main>
          <Footer />
        </div>
      </div>
      {isMobile && <MobileNavigation />}
    </div>
  );
}
