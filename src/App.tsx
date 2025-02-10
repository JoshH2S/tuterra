
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
import { BookOpen, ClipboardList, Brain, FileText, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const queryClient = new QueryClient();

const App = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

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
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();

    // Subscribe to profile changes
    const profileChannel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          // Update local state when profile is updated
          const newData = payload.new as { first_name: string; last_name: string; avatar_url: string };
          setFirstName(newData.first_name || "");
          setLastName(newData.last_name || "");
          setAvatarUrl(newData.avatar_url || "");
        }
      )
      .subscribe();

    return () => {
      profileChannel.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <Sidebar className="w-[260px] border-r border-border">
                <SidebarHeader>
                  <Link to="/" className="flex items-center p-4">
                    <span className="text-xl font-semibold text-primary">EduPortal</span>
                  </Link>
                </SidebarHeader>
                <SidebarContent className="flex flex-col justify-between h-[calc(100vh-64px)]">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/courses" className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Courses
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/lesson-planning" className="flex items-center">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Lesson Planning
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/quiz-generation" className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Quiz Generation
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/tutor" className="flex items-center">
                          <Brain className="mr-2 h-4 w-4" />
                          AI Tutor
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/profile-settings" className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage 
                              src={avatarUrl} 
                              alt="Profile" 
                              className="object-cover"
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                objectPosition: 'center'
                              }}
                            />
                            <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-left break-words leading-tight min-w-0">
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
