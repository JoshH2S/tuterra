
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ResultActionsProps {
  quizId: string;
  allowRetakes: boolean;
}

export function ResultActions({ quizId, allowRetakes }: ResultActionsProps) {
  const navigate = useNavigate();
  
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
        <Button
          onClick={() => navigate(`/take-quiz/${quizId}`)}
          className="min-w-[140px]"
        >
          Retake Quiz
        </Button>
      )}
    </div>
  );
}
