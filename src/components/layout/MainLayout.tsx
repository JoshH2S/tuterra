
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "./MainSidebar";
import AppRoutes from "@/routes/AppRoutes";
import { useCustomFont } from "@/hooks/useCustomFont";

export const MainLayout = () => {
  useCustomFont();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <MainSidebar />
          <main className="flex-1 px-4 md:px-8 py-4 md:py-8">
            <AppRoutes />
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default MainLayout;
