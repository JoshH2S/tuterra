
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useSwipeable } from "react-swipeable";

interface ResultsErrorProps {
  error: string | null;
}

export function ResultsError({ error }: ResultsErrorProps) {
  const navigate = useNavigate();
  
  // Add swipe gesture to go back (mobile-friendly)
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => navigate('/quizzes'),
    trackMouse: false
  });
  
  return (
    <div 
      className="container mx-auto py-8 px-4" 
      {...swipeHandlers}
    >
      <div className="max-w-md mx-auto text-center space-y-6 mt-8">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-red-500 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Error Loading Results</h1>
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 break-words">
            {error || "Could not find the requested quiz results."}
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          This may be due to a temporary issue or the quiz data may have been removed.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button 
            onClick={() => navigate('/quizzes')}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Quizzes
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
            variant="outline"
            size="lg"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
