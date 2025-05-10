
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
import { CourseGuide } from "@/components/onboarding/CourseGuide";

export const MainLayout = () => {
  useCustomFont();
  useKeyboardNavigation();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const isLandingPage = location.pathname === "/";
  const isDashboardPage = location.pathname === "/dashboard";

  useEffect(() => {
    if (!loading) {
      setIsLayoutReady(true);
    }
  }, [loading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
        <Layout isLandingPage={isLandingPage}>
          <AppRoutes />
        </Layout>
        {isDashboardPage && <CourseGuide />}
      </SidebarProvider>
    </TooltipProvider>
  );
};
