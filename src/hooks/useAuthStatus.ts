
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAuthStatus = () => {
  // Move all hooks to the top
  const { user, loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  
  // Handle auth state transitions
  useEffect(() => {
    // Only update login state when auth loading is complete
    if (!loading) {
      setIsLoggedIn(!!user);
      setIsReady(true);
    }
  }, [user, loading]);
  
  return {
    isLoggedIn,
    checkingAuth: loading || !isReady
  };
};
