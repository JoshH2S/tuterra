
import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Move all hooks to the top
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Keep track if the component is still mounted
    let isMounted = true;
    
    // Clean up auth state in localStorage if needed
    const cleanupAuthState = () => {
      // Look for stale auth tokens and clear them
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') && key.includes('stale')) {
          localStorage.removeItem(key);
        }
      });
    };
    
    // Set up auth listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      
      console.log("🔒 ProtectedRoute: Auth state changed:", _event, {
        hasSession: !!session,
        userId: session?.user?.id
      });
      
      setSession(session);
      
      // If session is established, check session validity
      if (session?.user) {
        try {
          // Check if session is valid by making a simple authenticated request
          const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
          setSessionValid(!!user && !error);
          
          // Check if onboarding is complete in database
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', session.user.id)
            .single();
            
          // Update localStorage with the database value
          if (profile) {
            localStorage.setItem("onboardingComplete", profile.onboarding_complete ? "true" : "false");
          }
        } catch (error) {
          console.error("Error checking session validity:", error);
          setSessionValid(false);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        setSessionValid(false);
        setLoading(false);
      }
      
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
    const initializeAuth = async () => {
      // Clean up any stale auth state
      cleanupAuthState();
      
      try {
        console.log("🔒 ProtectedRoute: Getting initial session");
        
        // Explicitly get the session to ensure we have the latest state
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("🔒 ProtectedRoute: Error getting session:", error);
          if (isMounted) {
            setSession(null);
            setSessionValid(false);
            setLoading(false);
            setIsInitialized(true);
          }
          return;
        }
        
        console.log("🔒 ProtectedRoute: Initial session check:", {
          hasSession: !!data.session,
          userId: data.session?.user?.id,
          tokenExists: !!data.session?.access_token
        });
        
        if (data.session && data.session.access_token) {
          // Verify the session is valid
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser(data.session.access_token);
            
            if (userError || !userData?.user) {
              console.error("🔒 ProtectedRoute: Invalid session token", userError);
              setSessionValid(false);
              // Try to refresh the session
              const { data: refreshData } = await supabase.auth.refreshSession();
              setSessionValid(!!refreshData.session);
              setSession(refreshData.session);
            } else {
              console.log("🔒 ProtectedRoute: Session validated successfully");
              setSessionValid(true);
              setSession(data.session);
            }
          } catch (verifyError) {
            console.error("🔒 ProtectedRoute: Error validating session:", verifyError);
            setSessionValid(false);
          }
        } else {
          setSessionValid(false);
          setSession(null);
        }
        
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      } catch (e) {
        console.error("🔒 ProtectedRoute: Exception during initialization:", e);
        if (isMounted) {
          setSession(null);
          setSessionValid(false);
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, loading, location.pathname, isInitialized]);

  // Compute access condition after all hooks are called
  const isAuthenticated = !!session && sessionValid;
  const isLoadingComplete = !loading && isInitialized;

  if (!isLoadingComplete) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-muted-foreground">
          Verifying authentication...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
