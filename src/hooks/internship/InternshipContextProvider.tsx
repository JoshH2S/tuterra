
import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createSession } from './internshipService';
import { InternshipSession } from './types';

interface InternshipContextType {
  loading: boolean;
  error: Error | null;
  currentSession: InternshipSession | null;
  setCurrentSession: (session: InternshipSession | null) => void;
  createInternshipSession: (jobTitle: string, industry: string, jobDescription: string) => Promise<string | null>;
}

const InternshipContext = createContext<InternshipContextType | undefined>(undefined);

export const InternshipContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentSession, setCurrentSession] = useState<InternshipSession | null>(null);

  const createInternshipSession = async (
    jobTitle: string,
    industry: string,
    jobDescription: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Double-check auth one more time
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error("No active auth session");
      }
      
      console.log("🔒 InternshipContext: Auth verified before createSession");
      
      const sessionId = await createSession(jobTitle, industry, jobDescription);
      return sessionId;
    } catch (err) {
      console.error("Error creating session:", err);
      setError(err instanceof Error ? err : new Error('Failed to create session'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    error,
    currentSession,
    setCurrentSession,
    createInternshipSession,
  };

  return (
    <InternshipContext.Provider value={value}>
      {children}
    </InternshipContext.Provider>
  );
};

export const useInternshipContext = (): InternshipContextType => {
  const context = useContext(InternshipContext);
  if (context === undefined) {
    throw new Error('useInternshipContext must be used within an InternshipContextProvider');
  }
  return context;
};
