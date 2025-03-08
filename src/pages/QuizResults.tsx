
import { useParams } from "react-router-dom";
import { useQuizResults } from "@/hooks/useQuizResults";
import { useQuizFeedback } from "@/hooks/useQuizFeedback";
import { ResultsLayout } from "@/components/quiz-results/ResultsLayout";

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
    <ResultsLayout
      results={results}
      loading={loading}
      error={error}
      generateFeedback={handleGenerateFeedback}
      generatingFeedback={generatingFeedback}
    />
  );
}
