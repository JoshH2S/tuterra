
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface AuthStateProviderProps {
  children: React.ReactNode;
}

export const AuthStateProvider: React.FC<AuthStateProviderProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only proceed once auth loading is complete
    if (!loading) {
      // Check for auth pages that should be skipped when already logged in
      const isAuthPage = location.pathname === "/auth" || 
                         location.pathname === "/signin" || 
                         location.pathname === "/signup";
      
      // Redirect already authenticated users away from auth pages
      if (user && isAuthPage) {
        // Get the intended destination from the state or default to dashboard
        const from = (location.state as any)?.from || "/dashboard";
        navigate(from, { replace: true });
      }
      
      // Now we're initialized
      setIsInitialized(true);
    }
  }, [user, loading, location, navigate]);

  // Show loading state while auth is initializing
  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};
