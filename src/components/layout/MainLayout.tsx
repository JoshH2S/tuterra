
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "./MainSidebar";
import { MobileNavigation } from "./mobile/MobileNavigation";
import { MobileHeader } from "./mobile/MobileHeader";
import { AppRoutes } from "@/routes/AppRoutes";
import { useCustomFont } from "@/hooks/useCustomFont";
import { useIsMobile } from "@/hooks/use-mobile";

export const MainLayout = () => {
  useCustomFont();
  const isMobile = useIsMobile();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <MainSidebar />
          <div className="flex-1 flex flex-col">
            {isMobile && <MobileHeader />}
            <main className="flex-1 px-4 md:px-8 py-4 md:py-8 pb-24 lg:pb-8">
              <AppRoutes />
            </main>
          </div>
          <MobileNavigation />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
