
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { RetakeConfirmDialog } from "@/components/quiz-taking/RetakeConfirmDialog";

interface ResultActionsProps {
  quizId: string;
  quizTitle: string;
  allowRetakes: boolean;
  previousScore?: number;
}

export function ResultActions({ quizId, quizTitle, allowRetakes, previousScore }: ResultActionsProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const handleRetakeConfirm = () => {
    navigate(`/take-quiz/${quizId}`);
  };
  
  return (
    <div className="flex flex-wrap justify-center gap-4 pt-6">
      <Button
        variant="outline"
        onClick={() => navigate('/quizzes')}
        className="min-w-[140px]"
      >
        Back to Quizzes
      </Button>
      {allowRetakes && (
        <>
          <Button
            onClick={() => setConfirmOpen(true)}
            className="min-w-[140px]"
          >
            Retake Quiz
          </Button>
          <RetakeConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleRetakeConfirm}
            quizTitle={quizTitle}
            previousScore={previousScore}
          />
        </>
      )}
    </div>
  );
}
