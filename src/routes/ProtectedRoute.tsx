
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (error: any) {
        console.error("Error fetching session:", error.message);
        toast({
          title: "Authentication Error",
          description: "Please try logging in again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};
