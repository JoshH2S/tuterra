import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingStates";
import { ModernCard } from "@/components/ui/modern-card";
import { Briefcase, Building2, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";

const InterviewInvite = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<{
    job_title: string;
    industry: string;
    job_description?: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [maxRetries, setMaxRetries] = useState(0);
  const [startingInterview, setStartingInterview] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(null);
  const isPolling = useRef(false);

  useEffect(() => {
    async function fetchSessionData() {
      if (!sessionId) {
        setError("Invalid session ID");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("internship_sessions")
          .select("job_title, industry, job_description")
          .eq("id", sessionId)
          .single();

        if (error) {
          console.error("Error fetching session:", error);
          setError("Unable to load internship details");
          toast({
            title: "Error",
            description: "We couldn't load your internship details",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Internship session not found");
          setLoading(false);
          return;
        }

        setSessionData(data);
        
        // Check if questions are already generated for this session
        await checkQuestionsExist();
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    }

    fetchSessionData();
  }, [sessionId]);
  
  // Function to check if questions exist with verification
  const checkQuestionsExist = async () => {
    if (!sessionId) return;
    
    try {
      console.log("Checking if questions exist for session:", sessionId);
      
      const { data, error } = await supabase.functions.invoke('get-interview-questions', {
        body: { sessionId }
      });
      
      if (error) {
        console.error("Error checking questions:", error);
        setQuestionsLoaded(false);
        setLoading(false);
        return false;
      }
      
      // If we have questions, mark them as loaded
      // The questions could be in data.questions or directly in the data array
      const hasQuestions = validateQuestionsData(data);
        
      console.log(`Questions ${hasQuestions ? 'found' : 'not found'} for session ${sessionId}`, 
        hasQuestions ? `(${getQuestionCount(data)} questions available)` : "");
      
      setQuestionsLoaded(hasQuestions);
      setLoading(false);
      return hasQuestions;
    } catch (err) {
      console.error("Error checking interview questions:", err);
      setQuestionsLoaded(false);
      setLoading(false);
      return false;
    }
  };
  
  // Helper to validate question data and count questions
  const validateQuestionsData = (data: any): boolean => {
    if (!data) return false;
    
    if (data?.questions && Array.isArray(data.questions)) {
      return data.questions.length > 0;
    }
    
    if (Array.isArray(data)) {
      return data.length > 0;
    }
    
    // If data is an object, check if any of its properties is an array with questions
    if (typeof data === 'object') {
      return Object.values(data).some(val => 
        Array.isArray(val) && val.length > 0 && 
        val.some((item: any) => item.question || item.text)
      );
    }
    
    return false;
  };
  
  // Helper to get question count from various data formats
  const getQuestionCount = (data: any): number => {
    if (!data) return 0;
    
    if (data?.questions && Array.isArray(data.questions)) {
      return data.questions.length;
    }
    
    if (Array.isArray(data)) {
      return data.length;
    }
    
    if (typeof data === 'object') {
      const questionArrays = Object.values(data).filter(val => 
        Array.isArray(val) && val.length > 0 &&
        val.some((item: any) => item.question || item.text)
      );
      
      if (questionArrays.length > 0) {
        return (questionArrays[0] as any[]).length;
      }
    }
    
    return 0;
  };
  
  // Poll for questions after generation
  useEffect(() => {
    if (!lastGenerationTime || isPolling.current) return;
    
    console.log("Starting polling for questions after generation");
    isPolling.current = true;
    
    // Poll for questions every 2 seconds for up to 30 seconds
    const maxPolls = 15; // 15 polls * 2 seconds = 30 seconds total
    let pollCount = 0;
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      console.log(`Polling for questions (${pollCount}/${maxPolls})...`);
      
      const hasQuestions = await checkQuestionsExist();
      if (hasQuestions) {
        console.log("Questions found during polling!");
        clearInterval(pollInterval);
        isPolling.current = false;
        
        // Show success message if questions were found
        toast({
          title: "Success",
          description: "Your interview questions are ready!",
        });
      } else if (pollCount >= maxPolls) {
        console.log("Reached max polls, stopping");
        clearInterval(pollInterval);
        isPolling.current = false;
        
        // If we've polled for 30 seconds and still no questions
        toast({
          title: "Warning",
          description: "We've been waiting for your questions but they're taking longer than expected. You may need to regenerate them.",
          variant: "warning",
        });
      }
    }, 2000);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(pollInterval);
      isPolling.current = false;
    };
  }, [lastGenerationTime]);
  
  // Generate interview questions if they don't exist yet
  const generateInterviewQuestions = async () => {
    if (!sessionId || !sessionData) return;
    
    // Prevent multiple simultaneous generation attempts
    if (generatingQuestions) return;
    
    setGeneratingQuestions(true);
    
    try {
      setMaxRetries(prev => prev + 1);
      if (maxRetries >= 3) {
        toast({
          title: "Maximum retries reached",
          description: "Please contact support if this issue persists.",
          variant: "destructive"
        });
        setGeneratingQuestions(false);
        return;
      }
      
      console.log("Generating interview questions for session:", sessionId);
      
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { 
          sessionId,
          jobTitle: sessionData.job_title,
          industry: sessionData.industry,
          jobDescription: sessionData.job_description || ""
        }
      });
      
      if (error) {
        console.error("Error invoking generate-interview-questions:", error);
        throw new Error("Failed to generate interview questions");
      }
      
      // If successful, set generation time to trigger polling
      console.log("Questions generation initiated successfully:", data);
      setLastGenerationTime(Date.now());
      
      toast({
        title: "Processing",
        description: "Your interview questions are being generated. This might take a moment...",
      });
    } catch (err) {
      console.error("Error generating questions:", err);
      toast({
        title: "Error",
        description: "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Modified to directly start the interview, not just navigate to the page
  const handleBeginInterview = async () => {
    if (!sessionId) return;
    
    setStartingInterview(true);
    
    if (!questionsLoaded) {
      // Try to generate questions if not loaded
      try {
        await generateInterviewQuestions();
        // Give a small delay to show the generation is happening
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (err) {
        console.error("Failed to generate questions before starting interview:", err);
        // Don't block proceeding - the simulator will use fallback questions
      }
    }
    
    // Final check if questions are available before navigation
    const finalCheck = await checkQuestionsExist();
    
    // Navigate directly to the interview simulator with a start parameter
    // The parameter will trigger auto-start in the simulator
    navigate(`/internship/interview/${sessionId}?start=true&questionsVerified=${finalCheck ? 'true' : 'false'}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground">Loading your interview details...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl text-red-500">
              Error Loading Interview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Unable to load interview details"}</p>
            <p className="mt-4">
              Try returning to the dashboard and starting again.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { job_title, industry } = sessionData;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:py-12">
      <div className="max-w-3xl mx-auto">
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 pb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Briefcase className="w-4 h-4" />
              <span>{job_title}</span>
              <span className="mx-1">–</span>
              <Building2 className="w-4 h-4" />
              <span>{industry}</span>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
              🎉 Congratulations!
            </CardTitle>
            <p className="mt-4 text-base md:text-lg">
              You've been selected to interview for the <span className="font-semibold">{job_title}</span> role 
              in the <span className="font-semibold">{industry}</span> sector. This is your chance to shine. 
              Be honest, be confident, and take your time.
            </p>
          </CardHeader>
          <CardContent className="pt-8">
            <h3 className="text-lg font-semibold mb-4">Interview Tips</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-green-600 dark:text-green-500">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Think about real experiences you can draw from</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Authentic examples from your background make your answers more compelling.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-green-600 dark:text-green-500">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Stay calm — this is a learning experience</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Take your time with each response and treat this as practice for your real interviews.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-green-600 dark:text-green-500">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">You'll receive helpful feedback after the interview</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    After completing all questions, you'll get personalized advice to improve.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-10 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800/60">
              <p className="text-amber-800 dark:text-amber-300 text-sm">
                <strong>Note:</strong> This is a simulated interview experience designed to help you prepare
                for real job interviews. Your responses will help tailor feedback for your improvement.
              </p>
            </div>
            
            {!questionsLoaded && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/60">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      Interview questions need to be prepared
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      Your questions didn't generate properly. Click below to try again.
                    </p>
                    <Button 
                      variant="outline"
                      className="mt-3"
                      onClick={generateInterviewQuestions}
                      disabled={generatingQuestions || isPolling.current}
                    >
                      {generatingQuestions || isPolling.current ? (
                        <div className="flex items-center space-x-2">
                          <LoadingSpinner size="small" />
                          <span>{isPolling.current ? "Checking for Questions..." : "Preparing Questions..."}</span>
                        </div>
                      ) : (
                        "Generate Interview Questions"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-2 pb-8">
            <Button 
              onClick={handleBeginInterview}
              className="w-full max-w-md py-6 text-base md:text-lg font-medium"
              size="lg"
              disabled={!questionsLoaded && !lastGenerationTime && maxRetries === 0 || startingInterview}
            >
              {startingInterview ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="small" />
                  <span>Starting Interview...</span>
                </div>
              ) : !questionsLoaded && !lastGenerationTime && maxRetries === 0 ? (
                "Please Generate Questions First"
              ) : (
                "Begin Interview"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default InterviewInvite;
