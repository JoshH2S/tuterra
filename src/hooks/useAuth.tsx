
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔒 useAuth: Initializing auth state");

    // Create a function to update both session and user
    const updateAuthState = (newSession: Session | null) => {
      console.log("🔒 useAuth: Updating auth state", {
        hasSession: !!newSession,
        userId: newSession?.user?.id,
        accessToken: newSession?.access_token ? "exists" : "null",
      });
      
      setSession(newSession);
      setUser(newSession?.user || null);
      
      if (!initialized) {
        setInitialized(true);
      }
      
      setLoading(false);
    };
    
    // Set up the auth change listener FIRST to catch any auth events that happen during initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`🔒 useAuth: Auth state changed: ${_event}`, { 
        hasUser: !!session?.user,
        userId: session?.user?.id,
        accessToken: session?.access_token ? "exists" : "null"
      });
      updateAuthState(session);
      
      // If auth status changed to signedIn, refresh the page data
      if (_event === 'SIGNED_IN') {
        // Use setTimeout to prevent potential auth deadlocks
        setTimeout(() => {
          console.log("🔄 useAuth: Triggering data refresh after sign-in");
          // Any additional data fetching can be done here
        }, 0);
      }
      
      // If signed out, perform cleanup
      if (_event === 'SIGNED_OUT') {
        console.log("🚪 useAuth: User signed out, cleaning up");
        // Use setTimeout to prevent potential auth deadlocks
        setTimeout(() => {
          // Additional cleanup can go here
        }, 0);
      }
    });

    // THEN check for existing session to set initial state
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          updateAuthState(null);
          return;
        }
        
        console.log("🔒 useAuth: Initial session check:", { 
          hasSession: !!data?.session,
          userId: data?.session?.user?.id,
          accessToken: data?.session?.access_token ? "exists" : "null"
        });
        updateAuthState(data.session);
      } catch (error) {
        console.error('Unexpected error in getSession:', error);
        updateAuthState(null);
      }
    };

    initializeAuth();

    // Clean up subscription when component unmounts
    return () => {
      console.log("🔒 useAuth: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [initialized]);

  // Helper function to clean up auth state in localStorage
  const cleanupAuthState = useCallback(() => {
    console.log("🧹 useAuth: Cleaning up auth state in localStorage");
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const signOut = useCallback(async () => {
    console.log("🔒 useAuth: Sign out initiated");
    try {
      setLoading(true);
      
      // First clean up any potential stale auth state
      cleanupAuthState();
      
      // Try global sign out first
      await supabase.auth.signOut({ scope: 'global' });
      
      // Update local state
      setUser(null);
      setSession(null);
      
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      });
      
      // Navigate to auth page
      navigate("/auth");
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, cleanupAuthState]);

  // Helper to verify if the current session is valid
  const verifySession = useCallback(async (): Promise<{valid: boolean, userId?: string}> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session || !data.session.access_token) {
        console.error("❌ useAuth: Session verification failed", error);
        return { valid: false };
      }
      
      // Double-check token by using getUser
      const { data: userData, error: userError } = await supabase.auth.getUser(data.session.access_token);
      if (userError || !userData?.user) {
        console.error("❌ useAuth: Token validation failed", userError);
        return { valid: false };
      }
      
      console.log("✅ useAuth: Session verified successfully", {
        userId: userData.user.id,
        email: userData.user.email
      });
      
      return { valid: true, userId: userData.user.id };
    } catch (error) {
      console.error("❌ useAuth: Error verifying session", error);
      return { valid: false };
    }
  }, []);

  return { 
    user, 
    session, 
    loading, 
    initialized, 
    signOut,
    verifySession,
    cleanupAuthState
  };
};
