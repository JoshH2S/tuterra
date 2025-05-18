
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInternship } from '@/hooks/internship';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  jobTitle: string;
  industry: string;
  jobDescription: string;
}

export function useInternshipForm() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading, verifySession, refreshSession } = useAuth();
  const { createInternshipSession, loading: createLoading } = useInternship();
  
  const [formData, setFormData] = useState<FormData>({
    jobTitle: "",
    industry: "",
    jobDescription: "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");
  const [formReady, setFormReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [verifyingAuth, setVerifyingAuth] = useState(false);
  
  // Use refs to track component lifecycle
  const isMounted = useRef(true);
  const retryAttempts = useRef(0);
  const maxRetries = 2;
  
  // Set up mounted ref for tracking component lifecycle
  useEffect(() => {
    isMounted.current = true;
    console.log("🔄 useInternshipForm: Component mounted");
    
    return () => {
      isMounted.current = false;
      console.log("🔄 useInternshipForm: Component unmounted");
    };
  }, []);
  
  // Ensure user is authenticated and session is fully loaded
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔒 useInternshipForm: Checking auth state", { 
        authLoading, 
        hasUser: !!user, 
        hasSession: !!session 
      });
      
      // Skip if already checking or if auth is still loading
      if (verifyingAuth || authLoading) return;
      
      // Check if user is already set from useAuth
      if (!authLoading) {
        // Double-check the session
        try {
          setVerifyingAuth(true);
          
          // Get the latest session state
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("🔒 useInternshipForm: Error getting session:", error);
            if (isMounted.current) {
              setFormReady(false);
            }
          } else {
            // Check if we have a valid session with access token
            const sessionReady = !!data.session && !!data.session.access_token;
            
            // If no valid session but user exists in state, try refreshing the token
            if (!sessionReady && user && retryAttempts.current < maxRetries) {
              console.log("🔄 useInternshipForm: Session missing but user exists, refreshing token");
              retryAttempts.current += 1;
              const refreshed = await refreshSession();
              
              if (refreshed && isMounted.current) {
                console.log("✅ useInternshipForm: Session refresh successful");
                setFormReady(true);
              }
            } else {
              // Normal case - set form ready if we have user and session
              if (isMounted.current) {
                setFormReady(sessionReady && !!user);
              }
            }
            
            console.log("🔒 useInternshipForm: Auth check completed", { 
              userExists: !!user,
              userId: user?.id,
              sessionExists: !!data.session,
              tokenExists: !!data.session?.access_token,
              formReady: sessionReady && !!user
            });
            
            // If no user or session after auth check completes, redirect to auth
            if ((!sessionReady || !user) && isMounted.current) {
              console.warn("⚠️ useInternshipForm: No valid auth state found, redirecting to auth");
              toast({
                title: "Authentication Required",
                description: "Please sign in to create an internship",
                variant: "destructive",
              });
              navigate("/auth", { state: { returnTo: "/internship/start" } });
            }
          }
          
          if (isMounted.current) {
            setAuthChecked(true);
          }
        } catch (error) {
          console.error("🔒 useInternshipForm: Error in auth check:", error);
        } finally {
          if (isMounted.current) {
            setVerifyingAuth(false);
          }
        }
      }
    };
    
    checkAuth();
  }, [authLoading, user, navigate, session, refreshSession]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const verifyAuthBeforeSubmit = async (): Promise<boolean> => {
    try {
      // Re-check auth session right before submission
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session || !data.session.access_token) {
        console.error("❌ useInternshipForm: Auth verification failed", { error, sessionExists: !!data.session });
        
        // Try to refresh the session once
        const refreshed = await refreshSession();
        if (!refreshed) {
          toast({
            title: "Authentication Error",
            description: "Your login session couldn't be verified. Please try refreshing the page.",
            variant: "destructive",
          });
          return false;
        }
        
        console.log("✅ useInternshipForm: Session refreshed successfully on pre-submit check");
        return true;
      }
      
      // Verify token validity with getUser
      const { data: userData, error: userError } = await supabase.auth.getUser(data.session.access_token);
      if (userError || !userData?.user) {
        console.error("❌ useInternshipForm: Token invalid", userError);
        
        // Try to refresh the session once
        const refreshed = await refreshSession();
        if (!refreshed) {
          toast({
            title: "Authentication Error", 
            description: "Your session appears to have expired. Please refresh the page or log in again.",
            variant: "destructive",
          });
          return false;
        }
        
        console.log("✅ useInternshipForm: Session refreshed successfully after invalid token");
        return true;
      }
      
      console.log("✅ useInternshipForm: Auth verified before submission", { 
        userId: data.session.user.id,
        tokenExists: !!data.session.access_token,
        tokenValid: !!userData.user
      });
      
      return true;
    } catch (error) {
      console.error("❌ useInternshipForm: Exception during auth verification", error);
      toast({
        title: "Authentication Error",
        description: "There was a problem verifying your login session. Please try refreshing.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const generateInterviewQuestions = async (sessionId: string): Promise<boolean> => {
    try {
      console.log("🔄 useInternshipForm: Generating interview questions for session:", sessionId);
      setProgressStatus("Preparing your interview questions...");
      
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { 
          sessionId,
          jobTitle: formData.jobTitle,
          industry: formData.industry,
          jobDescription: formData.jobDescription
        }
      });
      
      if (error) {
        console.error("❌ useInternshipForm: Error generating interview questions:", error);
        toast({
          title: "Error",
          description: "Failed to prepare interview questions. You can try again from the interview page.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log("✅ useInternshipForm: Successfully generated interview questions");
      return true;
    } catch (error) {
      console.error("❌ useInternshipForm: Exception generating interview questions:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while preparing interview questions.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission during auth verification
    if (verifyingAuth) {
      toast({
        title: "Please wait",
        description: "Verifying your account...",
      });
      return;
    }
    
    // Extra validation for user authentication
    if (!user || !session) {
      console.error("❌ useInternshipForm: User not authenticated on submit");
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an internship session",
        variant: "destructive",
      });
      navigate("/auth", { state: { returnTo: "/internship/start" } });
      return;
    }
    
    // Prevent double submission
    if (submitting || createLoading) {
      console.log("🚫 useInternshipForm: Preventing double submission");
      return;
    }
    
    // Form validation
    if (!formData.jobTitle.trim() || !formData.industry.trim() || !formData.jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields before continuing",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isMounted.current) {
        setSubmitting(true);
        setProgressStatus("Verifying authentication...");
      }
      
      // Pre-submit auth verification
      const authVerified = await verifyAuthBeforeSubmit();
      if (!authVerified) {
        if (isMounted.current) {
          setSubmitting(false);
          setProgressStatus("");
        }
        return;
      }
      
      console.log("📝 useInternshipForm: Form data being submitted:", { 
        ...formData, 
        userId: user.id
      });
      
      if (isMounted.current) {
        setProgressStatus("Creating your internship session...");
      }
      
      const sessionId = await createInternshipSession(
        formData.jobTitle,
        formData.industry,
        formData.jobDescription
      );
      
      if (sessionId) {
        console.log("✅ useInternshipForm: Session created with ID:", sessionId);
        
        if (isMounted.current) {
          setProgressStatus("Preparing interview questions...");
        }
        
        await generateInterviewQuestions(sessionId);
        
        if (isMounted.current) {
          // Navigate to the interview invite page
          navigate(`/internship/interview/invite/${sessionId}`);
        }
      } else {
        throw new Error("Failed to create internship session");
      }
    } catch (error) {
      console.error("❌ useInternshipForm: Error in submit handler:", error);
      
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to create internship session. Please try again.",
          variant: "destructive",
        });
        setSubmitting(false);
        setProgressStatus("");
      }
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
        setProgressStatus("");
      }
    }
  };
  
  return {
    formData,
    handleChange,
    handleSubmit,
    submitting,
    progressStatus,
    authLoading,
    formReady,
    authChecked,
    verifyingAuth,
    user,
    session
  };
}
