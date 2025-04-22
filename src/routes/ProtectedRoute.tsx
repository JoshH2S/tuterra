
import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Move all hooks to the top
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up auth listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      
      // If session is lost during app usage, redirect to auth
      // But only after initialization is complete
      if (!session && !loading && isInitialized) {
        navigate("/auth", { 
          replace: true,
          state: { from: location.pathname } // Save the current path to redirect back after login
        });
      }
    });

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [navigate, loading, location.pathname, isInitialized]);

  // Compute access condition after all hooks are called
  const isAuthenticated = !!session;
  const isLoadingComplete = !loading && isInitialized;

  if (!isLoadingComplete) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
