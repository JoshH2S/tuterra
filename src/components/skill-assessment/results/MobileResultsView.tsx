
import { AnimatePresence } from "framer-motion";
import { MobileTabHeader } from "./mobile/MobileTabHeader";
import { MobileTabIndicator } from "./mobile/MobileTabIndicator";
import { MobileSummaryView } from "./mobile/MobileSummaryView";
import { MobileQuestionsView } from "./mobile/MobileQuestionsView";
import { MobileAnalysisView } from "./mobile/MobileAnalysisView";
import { useTabNavigation } from "./mobile/useTabNavigation";

interface MobileResultsViewProps {
  result: {
    id: string;
    score: number;
    detailed_results: Array<{
      question: string;
      correct: boolean;
      userAnswer: string | string[];
      correctAnswer: string | string[];
      skill?: string;
    }>;
    skill_scores?: Record<string, { correct: number; total: number; score: number }>;
    time_spent?: number;
    level?: string;
    created_at: string;
  };
  userTier: string;
  recommendations: string[];
  benchmarks: {
    industry: string;
    role: string;
    averageScore: number;
  }[];
  skillBenchmarks?: Record<string, number>;
}

export const MobileResultsView = ({ 
  result, 
  userTier, 
  recommendations, 
  benchmarks,
  skillBenchmarks = {}
}: MobileResultsViewProps) => {
  const {
    activeView,
    swipeHandlers,
    handleViewChange,
    getDirection,
    slideVariants
  } = useTabNavigation();
  
  return (
    <div {...swipeHandlers} className="touch-manipulation">
      <MobileTabHeader 
        activeView={activeView} 
        handleViewChange={handleViewChange} 
      />
      
      <div className="min-h-[60vh] relative overflow-hidden">
        <AnimatePresence initial={false} custom={getDirection(activeView)}>
          {activeView === 'summary' && (
            <MobileSummaryView
              result={result}
              slideVariants={slideVariants}
              getDirection={getDirection}
            />
          )}
          
          {activeView === 'questions' && (
            <MobileQuestionsView
              result={result}
              slideVariants={slideVariants}
              getDirection={getDirection}
            />
          )}
          
          {activeView === 'analysis' && (
            <MobileAnalysisView
              result={result}
              userTier={userTier}
              recommendations={recommendations}
              benchmarks={benchmarks}
              skillBenchmarks={skillBenchmarks}
              slideVariants={slideVariants}
              getDirection={getDirection}
            />
          )}
        </AnimatePresence>
      </div>
      
      <MobileTabIndicator 
        activeView={activeView} 
        handleViewChange={handleViewChange} 
      />
    </div>
  );
};
