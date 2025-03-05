
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "@/lib/uuid";

type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

type Question = {
  id: string;
  text: string;
};

// Fallback questions in case API fails or returns too few questions
const FALLBACK_QUESTIONS = [
  "Tell me about your experience with similar roles in the past.",
  "How do you handle challenging situations in the workplace?",
  "What are your greatest strengths related to this position?",
  "Describe a time when you had to learn a new skill quickly.",
  "Where do you see yourself professionally in five years?"
];

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
  
  const generateQuestions = async () => {
    if (!industry || !role) return;
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { industry, role, jobDescription }
      });
      
      if (error) throw error;
      
      let formattedQuestions: Question[] = [];
      
      if (data?.questions && Array.isArray(data.questions) && data.questions.length >= 3) {
        formattedQuestions = data.questions.map((q: string) => ({
          id: uuidv4(),
          text: q
        }));
        console.log("Successfully generated questions:", formattedQuestions.length);
      } else {
        // Use fallback questions if API returns too few questions
        console.log("Using fallback questions due to insufficient API response");
        formattedQuestions = FALLBACK_QUESTIONS.map(q => ({
          id: uuidv4(),
          text: q
        }));
      }
      
      setQuestions(formattedQuestions);
      
      // Add welcome message to transcript
      const welcomeMessage = {
        id: uuidv4(),
        role: 'ai' as const,
        text: `Welcome to your interview for the ${role} position. I'll be asking you a series of questions to assess your fit for this role. Let's begin.`
      };
      
      setTranscript([welcomeMessage]);
      
      // Initialize responses array with empty slots for each question
      setUserResponses(new Array(formattedQuestions.length).fill(""));
      
      // Reset the current question index
      setCurrentQuestionIndex(0);
      
      console.log("Interview setup complete with", formattedQuestions.length, "questions");
    } catch (error) {
      console.error("Error generating questions:", error);
      
      // Use fallback questions on error
      const formattedQuestions = FALLBACK_QUESTIONS.map(q => ({
        id: uuidv4(),
        text: q
      }));
      
      setQuestions(formattedQuestions);
      
      // Add welcome message
      const welcomeMessage = {
        id: uuidv4(),
        role: 'ai' as const,
        text: `Welcome to your interview for the ${role || "requested"} position. I'll be asking you a series of questions to assess your fit for this role. Let's begin.`
      };
      
      setTranscript([welcomeMessage]);
      
      // Initialize responses array
      setUserResponses(new Array(formattedQuestions.length).fill(""));
      
      // Reset the current question index
      setCurrentQuestionIndex(0);
      
      toast({
        title: "Error",
        description: "Had trouble generating custom questions, but we've loaded some standard interview questions for you.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
    await generateQuestions();
  };

  const submitResponse = (response: string) => {
    // Add user response to transcript
    setTranscript(prev => [...prev, {
      id: uuidv4(),
      role: 'user',
      text: response
    }]);
    
    // Store the response in our responses array
    setUserResponses(prev => {
      const newResponses = [...prev];
      newResponses[currentQuestionIndex] = response;
      return newResponses;
    });
    
    // Add the current question to the transcript if it hasn't been added yet
    if (!transcript.some(msg => msg.id === currentQuestion.id)) {
      setTranscript(prev => [...prev, {
        id: currentQuestion.id,
        role: 'ai',
        text: currentQuestion.text
      }]);
    }
    
    // Move to next question if available
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        
        // Add the next question to the transcript
        const nextQuestion = questions[currentQuestionIndex + 1];
        setTranscript(prev => [...prev, {
          id: nextQuestion.id,
          role: 'ai',
          text: nextQuestion.text
        }]);
      }, 500);
    }
  };

  const generateFeedback = async () => {
    setIsGeneratingFeedback(true);
    
    try {
      // Extract just the question texts
      const questionTexts = questions.map(q => q.text);
      
      const { data, error } = await supabase.functions.invoke('generate-interview-feedback', {
        body: { 
          industry, 
          role, 
          jobDescription,
          questions: questionTexts,
          userResponses 
        }
      });
      
      if (error) throw error;
      
      if (data?.feedback) {
        setFeedback(data.feedback);
        console.log("Feedback generated successfully");
      } else {
        throw new Error("No feedback received");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast({
        title: "Error",
        description: "Failed to generate interview feedback. Please try again later.",
        variant: "destructive",
      });
      // Set a basic feedback message as fallback
      setFeedback("We couldn't generate detailed feedback at this time. Please try again later.");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const completeInterview = async () => {
    setIsInterviewCompleted(true);
    console.log("Interview completed, generating feedback...");
    
    // Add closing message to transcript
    setTranscript(prev => [...prev, {
      id: uuidv4(),
      role: 'ai',
      text: "Thank you for completing the interview. I'm now analyzing your responses to provide feedback."
    }]);
    
    // Generate AI feedback
    await generateFeedback();
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
