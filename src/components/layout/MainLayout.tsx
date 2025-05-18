
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
  const isAuthRelatedPage = location.pathname === "/auth" || 
                            location.pathname === "/forgot-password" || 
                            location.pathname === "/reset-password" || 
                            location.pathname === "/verify-email";

  // Log important state changes for debugging
  useEffect(() => {
    console.log("🔍 MainLayout: Auth state changed", { 
      loading, 
      hasUser: !!user, 
      userId: user?.id,
      pathname: location.pathname
    });
  }, [loading, user, location.pathname]);

  // Set layout ready when auth loading completes
  useEffect(() => {
    if (!loading) {
      console.log("✅ MainLayout: Auth loading complete, setting layout ready");
      setIsLayoutReady(true);
    }
  }, [loading]);

  // Scroll to top on route change for better mobile experience
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Show loading spinner only for routes that need authentication
  if (!isLayoutReady && !isLandingPage && !isAuthRelatedPage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading your experience...</p>
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
