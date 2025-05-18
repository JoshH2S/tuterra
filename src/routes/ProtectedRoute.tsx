
import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/shared/LoadingStates";

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
          const valid = !!user && !error;
          
          if (isMounted) {
            setSessionValid(valid);
            
            // If token validation fails, try to refresh the token
            if (!valid && isMounted) {
              console.log("🔄 ProtectedRoute: Invalid token, attempting refresh");
              const { data: refreshData } = await supabase.auth.refreshSession();
              if (refreshData.session) {
                setSession(refreshData.session);
                setSessionValid(true);
              }
            }
          }
          
          // Check if onboarding is complete in database
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', session.user.id)
            .single();
            
          // Update localStorage with the database value
          if (profile && isMounted) {
            localStorage.setItem("onboardingComplete", profile.onboarding_complete ? "true" : "false");
          }
        } catch (error) {
          console.error("Error checking session validity:", error);
          if (isMounted) setSessionValid(false);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setSessionValid(false);
          setLoading(false);
        }
      }
      
      // If session is lost during app usage, redirect to auth
      // But only after initialization is complete
      if (!session && !loading && isInitialized && isMounted) {
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
              if (isMounted) {
                setSessionValid(false);
                // Try to refresh the session
                const { data: refreshData } = await supabase.auth.refreshSession();
                setSessionValid(!!refreshData.session);
                setSession(refreshData.session);
              }
            } else {
              console.log("🔒 ProtectedRoute: Session validated successfully");
              if (isMounted) {
                setSessionValid(true);
                setSession(data.session);
              }
            }
          } catch (verifyError) {
            console.error("🔒 ProtectedRoute: Error validating session:", verifyError);
            if (isMounted) setSessionValid(false);
          }
        } else {
          if (isMounted) {
            setSessionValid(false);
            setSession(null);
          }
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
    // Mobile-friendly loading state with touch-friendly design
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <LoadingSpinner size="default" />
        <span className="mt-4 text-center text-muted-foreground text-base">
          Verifying authentication...
        </span>
        <p className="mt-2 text-sm text-center text-muted-foreground max-w-xs">
          This will only take a moment
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Render children with authentication context
  return <>{children}</>;
};
