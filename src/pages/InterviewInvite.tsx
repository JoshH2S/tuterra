
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingStates";
import { ModernCard } from "@/components/ui/modern-card";
import { Briefcase, Building2, CheckCircle, RefreshCw } from "lucide-react";

const InterviewInvite = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<{
    job_title: string;
    industry: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  useEffect(() => {
    async function fetchSessionData() {
      if (!sessionId) {
        setError("Invalid session ID");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("internship_sessions")
          .select("job_title, industry")
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
          return;
        }

        if (!data) {
          setError("Internship session not found");
          return;
        }

        setSessionData(data);
        
        // Check if questions are already generated for this session
        await checkQuestionsExist();
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchSessionData();
  }, [sessionId]);
  
  // Check if interview questions are already generated
  const checkQuestionsExist = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-interview-questions', {
        body: { sessionId }
      });
      
      if (error) {
        console.error("Error checking questions:", error);
        setQuestionsLoaded(false);
        return;
      }
      
      // If we have questions, mark them as loaded
      setQuestionsLoaded(data?.questions && data.questions.length > 0);
    } catch (err) {
      console.error("Error checking interview questions:", err);
      setQuestionsLoaded(false);
    }
  };
  
  // Generate interview questions if they don't exist yet
  const generateInterviewQuestions = async () => {
    if (!sessionId || !sessionData) return;
    
    setGeneratingQuestions(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { 
          sessionId,
          jobTitle: sessionData.job_title,
          industry: sessionData.industry,
          jobDescription: "" // We don't have this here, but the session should have it
        }
      });
      
      if (error) {
        throw new Error("Failed to generate interview questions");
      }
      
      // If successful, mark questions as loaded
      setQuestionsLoaded(true);
      toast({
        title: "Success",
        description: "Your interview questions are ready!",
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

  const handleBeginInterview = () => {
    navigate(`/internship/interview/${sessionId}`);
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
                  <RefreshCw className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">
                      Your interview questions need to be prepared
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Click the button below to generate questions for your interview.
                    </p>
                    <Button 
                      variant="outline"
                      className="mt-3"
                      onClick={generateInterviewQuestions}
                      disabled={generatingQuestions}
                    >
                      {generatingQuestions ? (
                        <div className="flex items-center space-x-2">
                          <LoadingSpinner size="small" />
                          <span>Preparing Questions...</span>
                        </div>
                      ) : (
                        "Prepare Interview Questions"
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
              disabled={!questionsLoaded}
            >
              {!questionsLoaded ? "Please Generate Questions First" : "Begin Interview"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default InterviewInvite;
