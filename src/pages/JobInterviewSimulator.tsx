
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterviewSetup } from "@/components/job-interview/InterviewSetup";
import { InterviewChat } from "@/components/job-interview/InterviewChat";
import { InterviewTranscript } from "@/components/job-interview/InterviewTranscript";
import { useJobInterview } from "@/hooks/useJobInterview";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

const JobInterviewSimulator = () => {
  const {
    industry,
    role,
    jobDescription,
    isInterviewStarted,
    isInterviewCompleted,
    setIndustry,
    setRole,
    setJobDescription,
    startInterview,
    completeInterview,
    transcript,
  } = useJobInterview();
  
  const isMobile = useIsMobile();
  const [showTranscript, setShowTranscript] = useState(false);
  const { toast } = useToast();

  // Auto-toggle to transcript on mobile when interview is completed
  useEffect(() => {
    if (isMobile && isInterviewCompleted) {
      setShowTranscript(true);
    }
  }, [isMobile, isInterviewCompleted]);

  // On mobile, allow toggling between chat and transcript
  const toggleTranscript = () => {
    setShowTranscript(!showTranscript);
  };

  // Handle interview start with proper error handling
  const handleStartInterview = () => {
    try {
      startInterview();
    } catch (error) {
      console.error("Failed to start interview:", error);
      toast({
        title: "Error",
        description: "There was a problem starting the interview. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">AI Job Interview Simulator</h1>
      
      {isMobile && isInterviewStarted && (
        <div className="mb-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleTranscript}
            className="mb-2"
          >
            {showTranscript ? "Back to Interview" : "View Transcript"}
          </Button>
        </div>
      )}
      
      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        <div className={`lg:col-span-2 ${isMobile && isInterviewStarted && showTranscript ? "hidden" : ""}`}>
          {!isInterviewStarted ? (
            <InterviewSetup 
              industry={industry}
              role={role}
              jobDescription={jobDescription}
              setIndustry={setIndustry}
              setRole={setRole}
              setJobDescription={setJobDescription}
              onStart={handleStartInterview}
            />
          ) : (
            <InterviewChat 
              isCompleted={isInterviewCompleted}
              onComplete={completeInterview}
            />
          )}
        </div>
        
        <div className={isMobile && isInterviewStarted 
          ? (showTranscript ? "" : "hidden") 
          : (isMobile && !isInterviewStarted ? "hidden" : "")
        }>
          {isInterviewStarted && (
            <Card className="h-full">
              <InterviewTranscript transcript={transcript} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInterviewSimulator;
