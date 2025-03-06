
import { useState, useCallback, useEffect } from 'react';
import { useInterviewState } from './useInterviewState';
import { useInterviewPersistence } from './useInterviewPersistence';
import { InterviewTranscript } from '@/types/interview';

export const useInterviewSession = () => {
  const {
    session,
    setSession,
    questions,
    setQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    responses,
    setResponses,
    isInterviewReady,
    setIsInterviewReady,
    isInterviewInProgress,
    setIsInterviewInProgress,
    isInterviewComplete,
    setIsInterviewComplete,
    isGeneratingQuestions,
    setIsGeneratingQuestions,
    resetState,
    updateResponse,
    getTranscript
  } = useInterviewState();
  
  const { saveResponse, completeSession } = useInterviewPersistence();
  
  const [industry, setIndustry] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [typingEffect, setTypingEffect] = useState(false);
  const [transcript, setTranscript] = useState<InterviewTranscript | null>(null);

  // Reset everything when component unmounts
  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  // Update current session ID when session changes
  useEffect(() => {
    if (session) {
      setCurrentSessionId(session.id);
    } else {
      setCurrentSessionId(null);
    }
  }, [session]);

  // Get current question
  const currentQuestion = questions[currentQuestionIndex]?.question || '';
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Start the chat after setup
  const handleStartChat = useCallback(() => {
    setIsInterviewInProgress(true);
    setCurrentQuestionIndex(0);
    setTypingEffect(true);
  }, [setIsInterviewInProgress, setCurrentQuestionIndex]);

  // Submit a response and move to next question
  const handleSubmitResponse = useCallback(async (response: string) => {
    if (!questions[currentQuestionIndex]) return;
    
    const questionId = questions[currentQuestionIndex].id;
    
    // Update local state
    updateResponse(questionId, response);
    
    try {
      // Save to database
      await saveResponse(questionId, response);
      
      // Move to next question or complete
      if (isLastQuestion) {
        if (session) {
          await completeSession(session.id);
        }
        
        // Create transcript before completing
        const fullTranscript = getTranscript();
        if (fullTranscript) {
          setTranscript(fullTranscript);
        }
        
        setIsInterviewInProgress(false);
        setIsInterviewComplete(true);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setTypingEffect(true);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  }, [
    questions, 
    currentQuestionIndex, 
    updateResponse, 
    saveResponse, 
    isLastQuestion, 
    session, 
    completeSession, 
    getTranscript, 
    setIsInterviewInProgress, 
    setIsInterviewComplete, 
    setCurrentQuestionIndex
  ]);

  // Download the interview transcript
  const handleDownloadTranscript = useCallback(() => {
    if (!transcript) return;
    
    let transcriptText = `Interview for ${transcript.jobTitle} position in ${transcript.industry}\n\n`;
    
    transcript.questions.forEach((item, index) => {
      transcriptText += `Question ${index + 1}: ${item.question}\n`;
      transcriptText += `Your Answer: ${item.response}\n\n`;
    });
    
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [transcript]);

  // Start a new interview
  const handleStartNew = useCallback(() => {
    resetState();
  }, [resetState]);

  return {
    // State
    industry,
    setIndustry,
    jobRole,
    setJobRole,
    jobDescription,
    setJobDescription,
    currentSessionId,
    setCurrentSessionId,
    questions,
    setQuestions,
    isGeneratingQuestions,
    setIsGeneratingQuestions,
    isInterviewInProgress,
    isInterviewComplete,
    typingEffect,
    transcript,
    currentQuestion,
    isLastQuestion,
    
    // Handlers
    handleStartChat,
    handleSubmitResponse,
    handleDownloadTranscript,
    handleStartNew
  };
};
