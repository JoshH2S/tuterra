
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
  const { user, loading: authLoading } = useAuth();
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
  
  // Ensure user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is already set from useAuth
      if (!authLoading) {
        setAuthChecked(true);
        setFormReady(!!user);
        
        console.log("🔒 useInternshipForm: Auth check completed", { 
          userExists: !!user,
          userId: user?.id,
          formReady: !!user
        });
        
        // If no user after auth check completes, redirect to auth
        if (!user) {
          console.warn("⚠️ useInternshipForm: No user found, redirecting to auth");
          toast({
            title: "Authentication Required",
            description: "Please sign in to create an internship",
            variant: "destructive",
          });
          navigate("/auth", { state: { returnTo: "/internship/start" } });
        }
      }
    };
    
    checkAuth();
  }, [authLoading, user, navigate]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    
    // Extra validation for user authentication
    if (!user) {
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
    user
  };
}
