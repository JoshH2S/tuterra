
import { useParams } from "react-router-dom";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useQuizFeedback } from "@/hooks/useQuizFeedback";
import { ResultsLayout } from "@/components/quiz-results/ResultsLayout";
import { QuizDisclaimer } from "@/components/quiz-generation/QuizDisclaimer";

export default function QuizResults() {
  const { id } = useParams();
  const { results, loading, error, setResults } = useQuizResults(id);
  const { generatingFeedback, generateFeedback } = useQuizFeedback(setResults);

  const handleGenerateFeedback = () => {
    if (id) {
      generateFeedback(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ResultsLayout
        results={results}
        loading={loading}
        error={error}
        generateFeedback={handleGenerateFeedback}
        generatingFeedback={generatingFeedback}
      />
      <div className="container mx-auto px-4 mt-auto">
        <QuizDisclaimer />
      </div>
    </div>
  );
}
