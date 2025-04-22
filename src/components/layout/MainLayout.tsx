
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Layout } from "./Layout";
import { AppRoutes } from "@/routes/AppRoutes";
import { useCustomFont } from "@/hooks/useCustomFont";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { useAuth } from "@/hooks/useAuth";
import { DesktopHeader } from "../layout/desktop/DesktopHeader";
import { SidebarUserProfile } from "../layout/sidebar/SidebarUserProfile";

export const MainLayout = () => {
  // Debug flags
  const DEBUG_DISABLE_HEADER = false;
  const DEBUG_DISABLE_SIDEBAR = false;

  // Move all hooks to the top
  useCustomFont();
  useKeyboardNavigation();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // Determine if sidebar should be hidden (synchronous)
  const hideSidebar = location.pathname === "/" || location.pathname === "/auth";

  // Handle auth state transitions
  useEffect(() => {
    if (!loading) {
      setIsLayoutReady(true);
    }
  }, [loading]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // If we're still initializing auth, show minimal layout
  if (!isLayoutReady && location.pathname !== "/" && location.pathname !== "/auth") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        {/* Debug header should only be present if not disabled */}
        {!DEBUG_DISABLE_HEADER && <DesktopHeader />}
        <Layout isLandingPage={hideSidebar}>
          <AppRoutes />
          {/* Debug sidebar user profile, if not disabled */}
          {!DEBUG_DISABLE_SIDEBAR && <SidebarUserProfile />}
        </Layout>
      </SidebarProvider>
    </TooltipProvider>
  );
};
