
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterviewSetup } from "@/components/job-interview/InterviewSetup";
import { InterviewChat } from "@/components/job-interview/InterviewChat";
import { InterviewTranscript } from "@/components/job-interview/InterviewTranscript";
import { useJobInterview } from "@/hooks/useJobInterview";
import { useIsMobile } from "@/hooks/use-mobile";

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

  // On mobile, allow toggling between chat and transcript
  const toggleTranscript = () => {
    setShowTranscript(!showTranscript);
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
              onStart={startInterview}
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
            <InterviewTranscript transcript={transcript} />
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInterviewSimulator;
