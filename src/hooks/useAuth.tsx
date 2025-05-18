
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
        userId: session?.user?.id
      });
      updateAuthState(session);
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
          userId: data?.session?.user?.id
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
  }, []);

  const signOut = useCallback(async () => {
    console.log("🔒 useAuth: Sign out initiated");
    try {
      setLoading(true);
      
      // First clean up any potential stale auth state
      const cleanupAuthState = () => {
        // Remove standard auth tokens
        localStorage.removeItem('supabase.auth.token');
        // Remove all Supabase auth keys from localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      };
      
      // Try global sign out first
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clean up auth state
      cleanupAuthState();
      
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
  }, [navigate]);

  return { user, session, loading, initialized, signOut };
};
