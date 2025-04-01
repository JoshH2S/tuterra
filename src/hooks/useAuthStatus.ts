
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAuthStatus = () => {
  const { user, loading } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);
  
  return {
    isLoggedIn,
    checkingAuth: loading
  };
};
