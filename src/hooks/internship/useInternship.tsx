
import { useState, useContext, createContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { InternshipSession, Task } from './types';

interface InternshipContextType {
  loading: boolean;
  createInternshipSession: (
    jobTitle: string,
    industry: string, 
    jobDescription: string
  ) => Promise<string | null>;
  // Add other internship-related functions here as needed
}

const InternshipContext = createContext<InternshipContextType | undefined>(undefined);

export const InternshipProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);

  const createInternshipSession = async (
    jobTitle: string,
    industry: string,
    jobDescription: string
  ): Promise<string | null> => {
    console.log("createInternshipSession called with:", { jobTitle, industry, jobDescription });
    setLoading(true);
    
    try {
      // Get authentication status
      console.log("Checking auth status in provider");
      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        console.error("No valid authentication session found");
        throw new Error("You must be logged in to create an internship");
      }
      
      console.log("Auth check passed, making API request");
      // Call edge function to create session (with authorization)
      const response = await fetch('https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/create-internship-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`
        },
        body: JSON.stringify({
          job_title: jobTitle,
          industry: industry,
          job_description: jobDescription
        })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API response:", result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create internship session');
      }
      
      toast({
        title: 'Success',
        description: 'Your virtual internship session has been created!',
      });
      
      return result.sessionId;
    } catch (error: any) {
      console.error("Error creating internship session:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create internship session',
        variant: 'destructive',
      });
      return null;
    } finally {
      console.log("Setting loading state to false");
      setLoading(false);
    }
  };

  return (
    <InternshipContext.Provider value={{
      loading,
      createInternshipSession,
      // Add other functions here
    }}>
      {children}
    </InternshipContext.Provider>
  );
};

export const useInternship = () => {
  const context = useContext(InternshipContext);
  if (context === undefined) {
    console.error("useInternship must be used within an InternshipProvider");
    throw new Error('useInternship must be used within an InternshipProvider');
  }
  return context;
};
