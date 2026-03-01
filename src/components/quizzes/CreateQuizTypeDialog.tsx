
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
      <DialogContent className="sm:max-w-md bg-[#F9F8F6] border-black/[0.06] overflow-hidden">
        {/* Visual anchor */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C8A84B]/70 via-amber-200/80 to-transparent" />

        <DialogHeader className="pt-2">
          <DialogTitle className="text-xl font-semibold tracking-tight text-[#091747]">
            Create a New Quiz
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400 leading-relaxed pt-1">
            Choose the type of quiz you want to create
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 pb-2">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStandardQuiz}
            className="p-5 flex flex-col items-center gap-3 bg-white border border-black/[0.06] rounded-xl text-center hover:border-[#C8A84B]/50 transition-all duration-150 ease-out shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
          >
            <FileText className="h-8 w-8 text-[#C8A84B]" />
            <div>
              <h3 className="font-medium text-[#091747] text-sm">Standard Quiz</h3>
              <p className="text-xs text-stone-400 leading-relaxed mt-1">
                Create a quiz based on your uploaded documents or study materials
              </p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCaseStudyQuiz}
            className="p-5 flex flex-col items-center gap-3 bg-white border border-black/[0.06] rounded-xl text-center hover:border-[#C8A84B]/50 transition-all duration-150 ease-out shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
          >
            <Newspaper className="h-8 w-8 text-[#C8A84B]" />
            <div>
              <h3 className="font-medium text-[#091747] text-sm">Case Study Quiz</h3>
              <p className="text-xs text-stone-400 leading-relaxed mt-1">
                Create questions that link topics to real-world news events from around the world
              </p>
            </div>
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
