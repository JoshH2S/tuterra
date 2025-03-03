
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ResultsErrorProps {
  error: string | null;
}

export function ResultsError({ error }: ResultsErrorProps) {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Error Loading Results</h1>
        <p>{error || "Could not find the requested quiz results."}</p>
        <Button onClick={() => navigate('/quizzes')}>
          Return to Quizzes
        </Button>
      </div>
    </div>
  );
}
