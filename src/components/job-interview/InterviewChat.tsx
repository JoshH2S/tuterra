
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Clock, Download } from "lucide-react";
import { useJobInterview } from "@/hooks/useJobInterview";
import { motion, AnimatePresence } from "framer-motion";

interface InterviewChatProps {
  isCompleted: boolean;
  onComplete: () => void;
}

export const InterviewChat = ({ isCompleted, onComplete }: InterviewChatProps) => {
  const [userResponse, setUserResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    currentQuestion, 
    submitResponse,
    remainingQuestions,
  } = useJobInterview();

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        // Optional: Set a time limit for response
        // setTimeLeft(120); // 2 minutes
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, isCompleted]);

  useEffect(() => {
    // Optional: Implement countdown timer
    if (timeLeft === null) return;
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    // Auto-submit when time runs out
    if (timeLeft === 0 && userResponse) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleSubmit = () => {
    if (userResponse.trim() && !isTyping) {
      submitResponse(userResponse);
      setUserResponse("");
      setTimeLeft(null);
      
      // Focus on textarea after submitting
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  // Handle keyboard submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="shadow-lg flex flex-col h-[600px] md:h-[550px]">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl">AI Interview</CardTitle>
          {timeLeft !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex items-center justify-center p-6 md:p-8">
        <AnimatePresence mode="wait">
          {isTyping ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="typing-indicator space-x-2 flex"
            >
              <div className="dot w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              <div className="dot w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="dot w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </motion.div>
          ) : isCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <h3 className="text-xl font-medium">Interview Completed!</h3>
              <p className="text-muted-foreground">
                Thank you for participating. You can now download your interview transcript.
              </p>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Transcript
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestion?.id || "question"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-lg md:text-xl max-w-xl mx-auto"
            >
              {currentQuestion?.text}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      
      {!isCompleted && (
        <CardFooter className="border-t p-4">
          <div className="flex flex-col w-full gap-3">
            <Textarea
              ref={textareaRef}
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response here..."
              className="resize-none min-h-[90px] md:min-h-[100px]"
              disabled={isTyping}
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {remainingQuestions > 0 ? `${remainingQuestions} questions remaining` : "Last question"}
              </div>
              <div className="flex gap-2">
                {remainingQuestions === 0 && (
                  <Button variant="outline" onClick={onComplete}>
                    Finish Interview
                  </Button>
                )}
                <Button 
                  onClick={handleSubmit} 
                  disabled={!userResponse.trim() || isTyping}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
