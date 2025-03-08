
import { QuizResponse } from "@/types/quiz-results";
import { ResultsLoader } from "./ResultsLoader";
import { ResultsError } from "./ResultsError";
import { ResultsContainer } from "./ResultsContainer";

interface ResultsLayoutProps {
  results: QuizResponse | null;
  loading: boolean;
  error: string | null;
  generateFeedback: () => void;
  generatingFeedback: boolean;
}

export function ResultsLayout({
  results,
  loading,
  error,
  generateFeedback,
  generatingFeedback
}: ResultsLayoutProps) {
  if (loading) return <ResultsLoader />;
  if (error || !results || !results.quiz) return <ResultsError error={error} />;

  return (
    <div className="container mx-auto py-8">
      <ResultsContainer 
        results={results}
        quiz={results.quiz}
        generateFeedback={generateFeedback}
        generatingFeedback={generatingFeedback}
      />
    </div>
  );
}
