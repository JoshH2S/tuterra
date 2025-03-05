
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
  const [questionsGenerated, setQuestionsGenerated] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const remainingQuestions = questions.length - currentQuestionIndex - 1;

  // Debug function to log interview state
  const logInterviewState = () => {
    console.log("=== Interview State ===");
    console.log("Number of questions available:", questions.length);
    console.log("Current question index:", currentQuestionIndex);
    console.log("Remaining questions:", remainingQuestions);
    console.log("Is interview completed:", isInterviewCompleted);
    console.log("Questions array:", questions);
    console.log("Current question:", currentQuestion);
    console.log("Transcript length:", transcript.length);
  };

  const generateQuestions = async () => {
    if (!industry || !role || !jobDescription) return;
    
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
      setQuestionsGenerated(true);
      console.log("Loaded questions:", formattedQuestions);
      
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
          
          logInterviewState();
        }, 1000);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      
      // Use fallback questions on error
      const formattedQuestions = FALLBACK_QUESTIONS.map(q => ({
        id: uuidv4(),
        text: q
      }));
      
      setQuestions(formattedQuestions);
      setQuestionsGenerated(true);
      console.log("Using fallback questions due to API error");
      
      // Add welcome message and first question
      const welcomeMessage = {
        id: uuidv4(),
        role: 'ai' as const,
        text: `Welcome to your interview for the ${role || "requested"} position. I'll be asking you a series of questions to assess your fit for this role. Let's begin.`
      };
      
      setTranscript([welcomeMessage]);
      
      setTimeout(() => {
        setTranscript(prev => [...prev, {
          id: formattedQuestions[0].id,
          role: 'ai',
          text: formattedQuestions[0].text
        }]);
        
        logInterviewState();
      }, 1000);
      
      toast({
        title: "Error",
        description: "Had trouble generating custom questions, but we've loaded some standard interview questions for you.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Make sure the questions are properly synchronized 
  useEffect(() => {
    if (questionsGenerated && questions.length > 0) {
      console.log("Questions are now available:", questions.length);
      logInterviewState();
    }
  }, [questionsGenerated, questions]);

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
    // Log interview state before processing the response
    console.log("Before response submission:");
    logInterviewState();
    
    // Add user response to transcript
    setTranscript(prev => [...prev, {
      id: uuidv4(),
      role: 'user',
      text: response
    }]);
    
    // Move to next question if available
    if (currentQuestionIndex < questions.length - 1) {
      console.log("Moving to next question...");
      
      // Delay moving to the next question for a more natural conversation flow
      setTimeout(() => {
        // Use a functional update to ensure we're working with the latest state
        setCurrentQuestionIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          console.log("Updating current question index:", prevIndex, "->", nextIndex);
          return nextIndex;
        });
        
        // Add next question to transcript
        setTimeout(() => {
          setTranscript(prev => {
            const nextQuestionIndex = currentQuestionIndex + 1;
            if (nextQuestionIndex < questions.length) {
              const nextQuestion = questions[nextQuestionIndex];
              console.log("Adding next question to transcript:", nextQuestion.text);
              return [...prev, {
                id: nextQuestion.id,
                role: 'ai',
                text: nextQuestion.text
              }];
            }
            return prev;
          });
          
          // Log state after adding the next question
          console.log("After adding next question:");
          logInterviewState();
        }, 500);
      }, 1500);
    } else {
      // Double-check that we've actually gone through all questions
      console.log("Final question answered. Completing interview...");
      if (questions.length > 0) {
        // Interview completed - add closing message
        setTimeout(() => {
          setTranscript(prev => [...prev, {
            id: uuidv4(),
            role: 'ai',
            text: "Thank you for completing the interview. You can now review your transcript or download it for future reference."
          }]);
          setIsInterviewCompleted(true);
          console.log("Interview marked as completed");
        }, 1500);
      } else {
        console.log("Warning: Interview completed with 0 questions");
        // Force at least one more interaction if we have no questions
        setTranscript(prev => [...prev, {
          id: uuidv4(),
          role: 'ai',
          text: "Thank you for your response. Unfortunately, I'm having trouble retrieving more questions. We'll conclude the interview here."
        }]);
        setIsInterviewCompleted(true);
      }
    }
  };

  const completeInterview = () => {
    setIsInterviewCompleted(true);
    console.log("Interview manually completed");
  };

  // Add an effect to monitor changes to the interview state
  useEffect(() => {
    if (isInterviewStarted) {
      console.log("Interview started with settings:", { industry, role });
    }
  }, [isInterviewStarted]);

  // Monitor question changes
  useEffect(() => {
    if (questions.length > 0) {
      console.log("Questions updated. Total questions:", questions.length);
    }
  }, [questions]);

  // Monitor current question changes
  useEffect(() => {
    if (questions.length > 0) {
      console.log("Current question changed to index:", currentQuestionIndex);
    }
  }, [currentQuestionIndex]);

  return {
    industry,
    role,
    jobDescription,
    isInterviewStarted,
    isInterviewCompleted,
    transcript,
    currentQuestion,
    remainingQuestions,
    questions,
    setIndustry,
    setRole,
    setJobDescription,
    startInterview,
    submitResponse,
    completeInterview,
  };
};
