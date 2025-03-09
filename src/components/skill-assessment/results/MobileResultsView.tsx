
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, List, BarChart } from "lucide-react";
import { ScoreSummary } from "./ScoreSummary";
import { DetailedQuestionsList } from "./DetailedQuestionsList";
import { AdvancedAnalysisSection } from "@/components/skill-assessment/PremiumFeatures";

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
}

export const MobileResultsView = ({ result, userTier, recommendations, benchmarks }: MobileResultsViewProps) => {
  const [activeView, setActiveView] = useState<'summary' | 'questions' | 'analysis'>('summary');
  
  // Set up swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeView === 'summary') setActiveView('questions');
      else if (activeView === 'questions') setActiveView('analysis');
    },
    onSwipedRight: () => {
      if (activeView === 'analysis') setActiveView('questions');
      else if (activeView === 'questions') setActiveView('summary');
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
  });
  
  return (
    <div {...swipeHandlers} className="touch-manipulation">
      {/* View selection tabs */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setActiveView('summary')}
          className={activeView === 'summary' ? "text-primary border-b-2 border-primary rounded-none" : "text-muted-foreground"}
        >
          Summary
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setActiveView('questions')}
          className={activeView === 'questions' ? "text-primary border-b-2 border-primary rounded-none" : "text-muted-foreground"}
        >
          Questions
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setActiveView('analysis')}
          className={activeView === 'analysis' ? "text-primary border-b-2 border-primary rounded-none" : "text-muted-foreground"}
        >
          Analysis
        </Button>
      </div>
      
      {/* View content */}
      <div className="min-h-[60vh]">
        {activeView === 'summary' && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Your assessment performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreSummary 
                score={result.score}
                timeSpent={result.time_spent}
                detailedResultsLength={result.detailed_results.length}
                level={result.level}
                skillScores={result.skill_scores}
              />
            </CardContent>
          </Card>
        )}
        
        {activeView === 'questions' && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>Question breakdown</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto pb-24">
              <DetailedQuestionsList questions={result.detailed_results || []} />
            </CardContent>
          </Card>
        )}
        
        {activeView === 'analysis' && (
          <div className="pb-16">
            <AdvancedAnalysisSection 
              userTier={userTier}
              skills={
                result.skill_scores 
                  ? Object.entries(result.skill_scores).map(([name, data]) => ({
                      name,
                      score: data.score
                    }))
                  : []
              }
              recommendations={recommendations}
              benchmarks={benchmarks}
            />
          </div>
        )}
      </div>
      
      {/* Navigation arrows - touch friendly */}
      <div className="flex justify-between mt-6 px-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            if (activeView === 'questions') setActiveView('summary');
            else if (activeView === 'analysis') setActiveView('questions');
          }}
          disabled={activeView === 'summary'}
          className="h-10 w-10 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex gap-1">
          <span className={`h-2 w-2 rounded-full ${activeView === 'summary' ? 'bg-primary' : 'bg-gray-300'}`}></span>
          <span className={`h-2 w-2 rounded-full ${activeView === 'questions' ? 'bg-primary' : 'bg-gray-300'}`}></span>
          <span className={`h-2 w-2 rounded-full ${activeView === 'analysis' ? 'bg-primary' : 'bg-gray-300'}`}></span>
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            if (activeView === 'summary') setActiveView('questions');
            else if (activeView === 'questions') setActiveView('analysis');
          }}
          disabled={activeView === 'analysis'}
          className="h-10 w-10 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
