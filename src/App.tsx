
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { useEffect, useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { BookOpen, ClipboardList, Brain, FileText, LayoutDashboard, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const loadFont = async () => {
      const font = new FontFace(
        'Quicksand',
        'url(https://fonts.gstatic.com/s/quicksand/v30/6xKtdSZaM9iE8KbpRA_hK1QN.woff2)'
      );

      try {
        await font.load();
        document.fonts.add(font);
        console.log('Quicksand font loaded successfully');
      } catch (error) {
        console.error('Error loading Quicksand font:', error);
      }
    };

    loadFont();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <Sidebar className="w-[160px] border-r border-border">
                <SidebarHeader>
                  <Link to="/" className="flex items-center p-4">
                    <span className="text-xl font-semibold text-primary">EduPortal</span>
                  </Link>
                </SidebarHeader>
                <SidebarContent className="flex flex-col justify-between h-[calc(100vh-64px)]">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/courses">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Courses
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/lesson-planning">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Lesson Planning
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/quiz-generation">
                          <FileText className="mr-2 h-4 w-4" />
                          Quiz Generation
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/tutor">
                          <Brain className="mr-2 h-4 w-4" />
                          AI Tutor
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <SidebarMenu className="mt-auto border-t border-border pt-4">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/profile-settings" className="flex items-start px-4">
                          <UserRound className="mr-2 h-4 w-4 mt-1" />
                          <span className="text-left break-words leading-tight">
                            {firstName && lastName ? `${firstName} ${lastName}` : "Profile Settings"}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarContent>
              </Sidebar>
              <main className="flex-1 px-4 md:px-8 py-4 md:py-8">
                <AppRoutes />
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
