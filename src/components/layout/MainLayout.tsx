
import { ReactNode } from "react";
import { DesktopHeader } from "./desktop/DesktopHeader";
import { MobileNavigation } from "./mobile/MobileNavigation";
import { MainSidebar } from "./MainSidebar";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Don't show the sidebar or header on these paths
  const isFullScreen = ["/interview-simulator", "/take-skill-assessment", "/take-quiz"].some(
    path => location.pathname.startsWith(path)
  );
  
  if (isFullScreen) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {!isMobile && <MainSidebar />}
        
        <main className="flex-1 flex flex-col">
          {isMobile ? <MobileNavigation /> : <DesktopHeader />}
          <div className="flex-1 p-4 md:p-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
