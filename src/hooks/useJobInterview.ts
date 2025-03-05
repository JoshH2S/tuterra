
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

  const currentQuestion = questions[currentQuestionIndex];
  const remainingQuestions = questions.length - currentQuestionIndex - 1;

  const generateQuestions = async () => {
    if (!industry || !role || !jobDescription) return;
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: { industry, role, jobDescription }
      });
      
      if (error) throw error;
      
      if (data?.questions && Array.isArray(data.questions)) {
        const formattedQuestions = data.questions.map((q: string) => ({
          id: uuidv4(),
          text: q
        }));
        
        setQuestions(formattedQuestions);
        
        // Add initial interviewer message to transcript
        const welcomeMessage = {
          id: uuidv4(),
          role: 'ai' as const,
          text: `Welcome to your interview for the ${role} position. I'll be asking you a series of questions to assess your fit for this role. Let's begin.`
        };
        
        setTranscript([welcomeMessage]);
        
        // Add first question to transcript after a short delay to simulate conversation
        if (formattedQuestions.length > 0) {
          setTimeout(() => {
            setTranscript(prev => [...prev, {
              id: formattedQuestions[0].id,
              role: 'ai',
              text: formattedQuestions[0].text
            }]);
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Error",
        description: "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startInterview = async () => {
    if (!industry || !role || !jobDescription) {
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
    
    // Move to next question if available
    if (currentQuestionIndex < questions.length - 1) {
      // Delay moving to the next question for a more natural conversation flow
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        
        // Add next question to transcript
        setTranscript(prev => [...prev, {
          id: questions[nextIndex].id,
          role: 'ai',
          text: questions[nextIndex].text
        }]);
      }, 800);
    } else {
      // Interview completed - add closing message
      setTimeout(() => {
        setTranscript(prev => [...prev, {
          id: uuidv4(),
          role: 'ai',
          text: "Thank you for completing the interview. You can now review your transcript or download it for future reference."
        }]);
        setIsInterviewCompleted(true);
      }, 800);
    }
  };

  const completeInterview = () => {
    setIsInterviewCompleted(true);
  };

  return {
    industry,
    role,
    jobDescription,
    isInterviewStarted,
    isInterviewCompleted,
    transcript,
    currentQuestion,
    remainingQuestions,
    setIndustry,
    setRole,
    setJobDescription,
    startInterview,
    submitResponse,
    completeInterview,
  };
};
