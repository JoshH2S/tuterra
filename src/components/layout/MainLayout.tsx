
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

export const MainLayout = () => {
  useCustomFont();
  useKeyboardNavigation();
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
        <Layout>
          <AppRoutes />
        </Layout>
      </SidebarProvider>
    </TooltipProvider>
  );
}
