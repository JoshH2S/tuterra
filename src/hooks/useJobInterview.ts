
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message, Question } from "@/types/interview";
import { generateInterviewQuestions } from "@/services/interviewQuestionService";
import { generateInterviewFeedback } from "@/services/interviewFeedbackService";
import { 
  createWelcomeMessage, 
  createUserResponseMessage, 
  createQuestionMessage,
  createCompletionMessage
} from "@/services/interviewTranscriptService";

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
      // Generate interview questions
      const generatedQuestions = await generateInterviewQuestions(industry, role, jobDescription);
      setQuestions(generatedQuestions);
      
      // Add welcome message
      const welcomeMessage = createWelcomeMessage(role);
      setTranscript([welcomeMessage]);
      
      // Initialize responses array with empty slots for each question
      setUserResponses(new Array(generatedQuestions.length).fill(""));
      
      // Reset the current question index
      setCurrentQuestionIndex(0);
      
      console.log("Interview setup complete with", generatedQuestions.length, "questions");
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
      const generatedFeedback = await generateInterviewFeedback(
        industry,
        role,
        jobDescription,
        questions,
        userResponses
      );
      setFeedback(generatedFeedback);
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
    setIndustry,
    setRole,
    setJobDescription,
    startInterview,
    submitResponse,
    completeInterview,
  };
};
