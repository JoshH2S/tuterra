
import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute initialization');
    
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('ProtectedRoute auth state change:', _event);
      setSession(session);
      setLoading(false);
      
      // If session is lost during app usage, redirect to auth
      if (!session && !loading) {
        console.log('Session lost, redirecting to auth');
        navigate("/auth", { 
          replace: true,
          state: { from: location.pathname } // Save the current path to redirect back after login
        });
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('ProtectedRoute initial session:', !!session);
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Add debugging for localStorage
  useEffect(() => {
    try {
      console.log('localStorage check:', {
        available: !!window.localStorage,
        writable: (() => {
          try {
            window.localStorage.setItem('test', 'test');
            window.localStorage.removeItem('test');
            return true;
          } catch (e) {
            return false;
          }
        })()
      });
    } catch (e) {
      console.error('localStorage access error:', e);
    }
  }, []);

  // All hooks must be called before any conditional returns
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!session) {
    console.log('No session found, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  console.log('Session verified, rendering protected content');
  return <>{children}</>;
};
