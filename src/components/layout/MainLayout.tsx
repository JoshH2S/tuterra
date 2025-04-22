
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Layout } from "./Layout";
import { AppRoutes } from "@/routes/AppRoutes";
import { useCustomFont } from "@/hooks/useCustomFont";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { AuthStateProvider } from "@/components/auth/AuthStateProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const MainLayout = () => {
  useCustomFont();
  useKeyboardNavigation();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Don't show sidebar on landing page and auth pages
  const hideSidebar = location.pathname === "/" || location.pathname === "/auth";

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <AuthStateProvider>
            <Layout isLandingPage={hideSidebar}>
              <AppRoutes />
            </Layout>
          </AuthStateProvider>
        </SidebarProvider>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
