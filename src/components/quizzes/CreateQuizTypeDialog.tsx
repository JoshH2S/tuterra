
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Newspaper } from "lucide-react";
import { motion } from "framer-motion";

interface CreateQuizTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateQuizTypeDialog({ 
  open, 
  onOpenChange 
}: CreateQuizTypeDialogProps) {
  const navigate = useNavigate();
  
  const handleStandardQuiz = () => {
    navigate("/quizzes/quiz-generation");
    onOpenChange(false);
  };

  const handleCaseStudyQuiz = () => {
    navigate("/quizzes/case-study-quiz");
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Create a New Quiz</DialogTitle>
          <DialogDescription className="pt-2">
            Choose the type of quiz you want to create
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline" 
              className="w-full h-auto p-6 flex flex-col items-center justify-center gap-3 border-2 hover:border-primary"
              onClick={handleStandardQuiz}
            >
              <FileText className="h-10 w-10 text-primary" />
              <div className="space-y-2 text-center">
                <h3 className="font-medium">Standard Quiz</h3>
                <p className="text-sm text-muted-foreground">
                  Create a quiz based on your uploaded documents or study materials
                </p>
              </div>
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline" 
              className="w-full h-auto p-6 flex flex-col items-center justify-center gap-3 border-2 hover:border-primary"
              onClick={handleCaseStudyQuiz}
            >
              <Newspaper className="h-10 w-10 text-primary" />
              <div className="space-y-2 text-center">
                <h3 className="font-medium">Case Study Quiz</h3>
                <p className="text-sm text-muted-foreground">
                  Create questions that link topics to real-world news events from around the world
                </p>
              </div>
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
