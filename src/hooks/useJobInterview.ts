
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message, Question, InterviewConfig, FeedbackResponse } from "@/types/interview";
import { interviewQuestionService } from "@/services/interviewQuestionService";
import { interviewFeedbackService } from "@/services/interviewFeedbackService";
import { 
  createWelcomeMessage, 
  createUserResponseMessage, 
  createQuestionMessage,
  createCompletionMessage
} from "@/services/interviewTranscriptService";
import { v4 as uuidv4 } from "@/lib/uuid";

export const useJobInterview = () => {
  const { toast } = useToast();
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<string | undefined>(undefined);
  const [detailedFeedback, setDetailedFeedback] = useState<FeedbackResponse | undefined>(undefined);
  const [interviewMetadata, setInterviewMetadata] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");

  const currentQuestion = questions[currentQuestionIndex];
  
  const startInterview = async () => {
    if (!industry || !role) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields before starting the interview.",
        variant: "destructive",
      });
      return;
    }
    
    setIsInterviewStarted(true);
    setIsGenerating(true);
    
    try {
      // Generate interview questions using the new service
      const interviewConfig: InterviewConfig = {
        industry,
        role, 
        jobDescription,
        numberOfQuestions: 5 // Optional: let user configure this later
      };
      
      const result = await interviewQuestionService.generateInterviewQuestions(interviewConfig);
      setQuestions(result.questions);
      setInterviewMetadata(result.metadata);
      
      // Generate a session ID for this interview
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      
      // Add welcome message
      const welcomeMessage = createWelcomeMessage(role);
      setTranscript([welcomeMessage]);
      
      // Initialize responses array with empty slots for each question
      setUserResponses(new Array(result.questions.length).fill(""));
      
      // Reset the current question index
      setCurrentQuestionIndex(0);
      
      console.log("Interview setup complete with", result.questions.length, "questions");
      console.log("Interview metadata:", result.metadata);
      console.log("Session ID:", newSessionId);
    } catch (error) {
      console.error("Error setting up interview:", error);
      toast({
        title: "Error",
        description: "Had trouble generating custom questions, but we've loaded some standard interview questions for you.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const submitResponse = (response: string) => {
    // Add user response to transcript
    const userMessage = createUserResponseMessage(response);
    setTranscript(prev => [...prev, userMessage]);
    
    // Store the response in our responses array
    setUserResponses(prev => {
      const newResponses = [...prev];
      newResponses[currentQuestionIndex] = response;
      return newResponses;
    });
    
    // Add the current question to the transcript if it hasn't been added yet
    if (!transcript.some(msg => msg.id === currentQuestion.id)) {
      const questionMessage = createQuestionMessage(currentQuestion);
      setTranscript(prev => [...prev, questionMessage]);
    }
    
    // Move to next question if available
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        
        // Add the next question to the transcript
        const nextQuestion = questions[currentQuestionIndex + 1];
        const nextQuestionMessage = createQuestionMessage(nextQuestion);
        setTranscript(prev => [...prev, nextQuestionMessage]);
      }, 500);
    }
  };

  const completeInterview = async () => {
    setIsInterviewCompleted(true);
    console.log("Interview completed, generating feedback...");
    
    // Add closing message to transcript
    const completionMessage = createCompletionMessage();
    setTranscript(prev => [...prev, completionMessage]);
    
    // Generate AI feedback
    setIsGeneratingFeedback(true);
    try {
      // Use the enhanced feedback service with detailed metrics
      const generatedFeedback = await interviewFeedbackService.generateInterviewFeedback(
        industry,
        role,
        jobDescription,
        questions,
        userResponses
      );
      
      setFeedback(generatedFeedback);
      
      // Try to get detailed feedback from the database
      try {
        const feedbackHistory = await interviewFeedbackService.getFeedbackHistory();
        if (feedbackHistory && feedbackHistory.length > 0) {
          setDetailedFeedback(feedbackHistory[0]); // Most recent feedback
        }
      } catch (detailError) {
        console.error("Error fetching detailed feedback:", detailError);
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast({
        title: "Error",
        description: "Failed to generate interview feedback. Please try again later.",
        variant: "destructive",
      });
      setFeedback("We couldn't generate detailed feedback at this time. Please try again later.");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // Add a new method to regenerate feedback
  const regenerateFeedback = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No active interview session to regenerate feedback for.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingFeedback(true);
    try {
      await interviewFeedbackService.regenerateFeedback(sessionId);
      
      // Fetch the updated feedback
      const feedbackHistory = await interviewFeedbackService.getFeedbackHistory();
      if (feedbackHistory && feedbackHistory.length > 0) {
        const latestFeedback = feedbackHistory[0];
        setDetailedFeedback(latestFeedback);
        setFeedback(latestFeedback.detailedFeedback || "Feedback regenerated successfully.");
        
        toast({
          title: "Success",
          description: "Interview feedback has been regenerated.",
        });
      }
    } catch (error) {
      console.error("Error regenerating feedback:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate feedback. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // Add a method to get interview history
  const getInterviewHistory = async () => {
    try {
      return await interviewFeedbackService.getFeedbackHistory();
    } catch (error) {
      console.error("Error fetching interview history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interview history.",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    industry,
    role,
    jobDescription,
    isInterviewStarted,
    isInterviewCompleted,
    transcript,
    currentQuestion,
    questions,
    currentQuestionIndex,
    isGeneratingFeedback,
    feedback,
    detailedFeedback,
    interviewMetadata,
    sessionId,
    setIndustry,
    setRole,
    setJobDescription,
    startInterview,
    submitResponse,
    completeInterview,
    regenerateFeedback,
    getInterviewHistory
  };
};
