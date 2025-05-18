
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-simple";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingStates";
import { industryOptions } from "@/data/industry-options";
import { useInternship } from "@/hooks/internship";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const InternshipStart = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { createInternshipSession, loading: createLoading } = useInternship();
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "",
    jobDescription: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");
  const [authReady, setAuthReady] = useState(false);

  // Track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);

  // Effect to track mounted state and log auth state
  useEffect(() => {
    setIsMounted(true);
    console.log("🔍 InternshipStart: Component mounted, auth state:", { 
      userExists: !!user, 
      userId: user?.id, 
      authLoading,
      authReady: !authLoading && !!user
    });
    
    // Consider auth ready when loading is false and user exists
    if (!authLoading) {
      const isReady = !!user;
      setAuthReady(isReady);
      console.log(`🔒 Auth state ready: ${isReady ? "YES" : "NO"}, user: ${user ? user.id : "null"}`);
      
      // If no user and not loading, redirect to auth
      if (!user) {
        console.warn("⚠️ No authenticated user found after auth loading completed");
        toast({
          title: "Authentication Required",
          description: "Please sign in to create an internship session",
          variant: "destructive",
        });
        navigate("/auth");
      }
    }
    
    return () => {
      setIsMounted(false);
    };
  }, [user, authLoading, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate interview questions for the session
  const generateInterviewQuestions = async (sessionId: string) => {
    try {
      console.log("🔄 InternshipStart: Generating interview questions for session:", sessionId);
      setProgressStatus("Preparing your interview questions...");
      
      // IMPORTANT: Use supabase.functions.invoke instead of direct fetch
      // This ensures proper auth headers and works in all environments
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { 
          sessionId,
          jobTitle: formData.jobTitle,
          industry: formData.industry,
          jobDescription: formData.jobDescription
        }
      });
      
      if (error) {
        console.error("❌ InternshipStart: Error generating interview questions:", error);
        toast({
          title: "Error",
          description: "Failed to prepare your interview questions. You can try again from the interview page.",
          variant: "destructive",
        });
        // Continue to the invite page anyway, they can retry question generation there
        return false;
      }
      
      console.log("✅ InternshipStart: Successfully generated interview questions:", data);
      return true;
    } catch (error) {
      console.error("❌ InternshipStart: Exception generating interview questions:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while preparing your interview questions.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 InternshipStart: Form submit handler triggered", {
      isAuthenticated: !!user,
      userId: user?.id,
      authLoading,
      submitting,
      formData
    });
    
    // Double check authentication is ready
    if (!user) {
      console.error("❌ InternshipStart: User not authenticated on submit");
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
      console.log("🚫 InternshipStart: Preventing double submission");
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
      console.log("📝 InternshipStart: Form data being submitted:", formData);
      setProgressStatus("Creating your internship session...");
      
      // Create internship session
      console.log("🔄 InternshipStart: Calling createInternshipSession function");
      const sessionId = await createInternshipSession(
        formData.jobTitle,
        formData.industry,
        formData.jobDescription
      );
      
      console.log("✅ InternshipStart: createInternshipSession returned", { sessionId });

      if (sessionId) {
        // Session created successfully or an existing session was found
        setGeneratingQuestions(true);
        
        // Check if we need to generate interview questions (may not be needed for existing sessions)
        // We'll try to generate them anyway to ensure the session has questions
        const questionsGenerated = await generateInterviewQuestions(sessionId);
        
        console.log("➡️ InternshipStart: Redirecting to interview invitation page", sessionId);
        
        // Show a toast message if this was an existing session
        const isExistingSession = submitting && !createLoading;
        if (isExistingSession) {
          toast({
            title: "Existing Internship Found",
            description: "You already have an internship with these criteria. Redirecting you to it.",
            duration: 5000,
          });
        }
        
        // Redirect to the interview invitation page with session ID
        if (isMounted) {
          navigate(`/internship/interview/invite/${sessionId}`);
        }
      } else {
        console.error("❌ InternshipStart: No sessionId returned but no error thrown");
        toast({
          title: "Error",
          description: "Failed to create internship session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ InternshipStart: Error in submit handler:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      if (isMounted) {
        setSubmitting(false);
        setGeneratingQuestions(false);
        setProgressStatus("");
      }
    }
  };

  // Determine if form should be enabled
  const isFormDisabled = authLoading || !user;
  const isSubmitDisabled = isFormDisabled || submitting || createLoading || generatingQuestions;

  // Show loading state while authentication is being determined
  if (authLoading) {
    return (
      <div className="container mx-auto py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle className="text-center">Loading</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <LoadingSpinner size="default" />
            <p className="mt-4 text-muted-foreground text-center">
              Checking authentication status...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Start Your Virtual Internship</h1>
        <p className="text-muted-foreground">
          Complete the form below to begin your personalized virtual internship experience.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
          <CardDescription>
            Enter details about the job you're interested in to tailor your internship experience.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                placeholder="e.g. Software Developer, Marketing Specialist"
                value={formData.jobTitle}
                onChange={handleChange}
                required
                className="w-full"
                disabled={isFormDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                options={industryOptions}
                placeholder="Select industry"
                required
                className="w-full"
                disabled={isFormDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                placeholder="Enter the job description or key responsibilities..."
                value={formData.jobDescription}
                onChange={handleChange}
                rows={6}
                required
                className="w-full"
                disabled={isFormDisabled}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitDisabled}
            >
              {(submitting || createLoading || generatingQuestions) ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="small" />
                  <span>{progressStatus || "Processing..."}</span>
                </div>
              ) : (
                "Start Internship"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default InternshipStart;
