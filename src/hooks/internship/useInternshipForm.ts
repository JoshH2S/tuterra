
import { useState, useEffect } from 'react';
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
  const { user, session, loading: authLoading } = useAuth();
  const { createInternshipSession, loading: createLoading } = useInternship();
  
  const [formData, setFormData] = useState<FormData>({
    jobTitle: "",
    industry: "",
    jobDescription: "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");
  const [formReady, setFormReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [verifyingAuth, setVerifyingAuth] = useState(false);
  
  // Ensure user is authenticated and session is fully loaded
  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is already set from useAuth
      if (!authLoading) {
        // Double-check the session
        try {
          setVerifyingAuth(true);
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("🔒 useInternshipForm: Error getting session:", error);
            setFormReady(false);
          } else {
            const sessionReady = !!data.session && !!data.session.access_token;
            setFormReady(sessionReady && !!user);
            
            console.log("🔒 useInternshipForm: Auth check completed", { 
              userExists: !!user,
              userId: user?.id,
              sessionExists: !!data.session,
              tokenExists: !!data.session?.access_token,
              formReady: sessionReady && !!user
            });
            
            // If no user or session after auth check completes, redirect to auth
            if (!sessionReady || !user) {
              console.warn("⚠️ useInternshipForm: No valid auth state found, redirecting to auth");
              toast({
                title: "Authentication Required",
                description: "Please sign in to create an internship",
                variant: "destructive",
              });
              navigate("/auth", { state: { returnTo: "/internship/start" } });
            }
          }
          
          setAuthChecked(true);
        } finally {
          setVerifyingAuth(false);
        }
      }
    };
    
    checkAuth();
  }, [authLoading, user, navigate, session]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
        toast({
          title: "Authentication Error",
          description: "Your login session couldn't be verified. Please try refreshing the page.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log("✅ useInternshipForm: Auth verified before submission", { 
        userId: data.session.user.id,
        tokenExists: !!data.session.access_token
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
      navigate("/auth");
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
    
    // Pre-submit auth verification
    const authVerified = await verifyAuthBeforeSubmit();
    if (!authVerified) {
      return;
    }
    
    try {
      setSubmitting(true);
      console.log("📝 useInternshipForm: Form data being submitted:", { 
        ...formData, 
        userId: user.id
      });
      
      setProgressStatus("Creating your internship session...");
      const sessionId = await createInternshipSession(
        formData.jobTitle,
        formData.industry,
        formData.jobDescription
      );
      
      console.log("✅ useInternshipForm: Session created with ID:", sessionId);
      
      if (sessionId) {
        setGeneratingQuestions(true);
        await generateInterviewQuestions(sessionId);
        navigate(`/internship/interview/invite/${sessionId}`);
      } else {
        throw new Error("Failed to create internship session");
      }
    } catch (error) {
      console.error("❌ useInternshipForm: Error in submit handler:", error);
      toast({
        title: "Error",
        description: "Failed to create internship session. Please try again.",
        variant: "destructive",
      });
      
      // Try one more time after a short delay if there might be an auth issue
      if (error instanceof Error && error.message?.includes('auth')) {
        setTimeout(async () => {
          try {
            console.log("🔄 useInternshipForm: Retrying submission after auth error");
            const authVerified = await verifyAuthBeforeSubmit();
            if (!authVerified) return;
            
            // Retry submission
            setProgressStatus("Retrying session creation...");
            const sessionId = await createInternshipSession(
              formData.jobTitle,
              formData.industry,
              formData.jobDescription
            );
            
            if (sessionId) {
              toast({
                title: "Success",
                description: "Session created on second attempt!",
              });
              setGeneratingQuestions(true);
              await generateInterviewQuestions(sessionId);
              navigate(`/internship/interview/invite/${sessionId}`);
            }
          } catch (retryError) {
            console.error("❌ useInternshipForm: Retry failed:", retryError);
          }
        }, 1500);
      }
    } finally {
      setSubmitting(false);
      setGeneratingQuestions(false);
      setProgressStatus("");
    }
  };
  
  return {
    formData,
    handleChange,
    handleSubmit,
    submitting,
    generatingQuestions,
    progressStatus,
    authLoading,
    createLoading,
    formReady,
    authChecked,
    verifyingAuth,
    user,
    session
  };
}
