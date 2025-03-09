
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
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
  
  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };
  
  // Direction of animation
  const getDirection = (newView: string) => {
    if (newView === 'summary' && activeView === 'questions') return -1;
    if (newView === 'analysis' && activeView === 'questions') return 1;
    if (newView === 'questions' && activeView === 'summary') return 1;
    if (newView === 'questions' && activeView === 'analysis') return -1;
    return 0;
  };
  
  const handleViewChange = (newView: 'summary' | 'questions' | 'analysis') => {
    setActiveView(newView);
  };
  
  return (
    <div {...swipeHandlers} className="touch-manipulation">
      {/* View selection tabs with animated underline */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <motion.div className="flex justify-between w-full relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleViewChange('summary')}
            className={activeView === 'summary' ? "text-primary" : "text-muted-foreground"}
          >
            Summary
            {activeView === 'summary' && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                layoutId="underline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleViewChange('questions')}
            className={activeView === 'questions' ? "text-primary" : "text-muted-foreground"}
          >
            Questions
            {activeView === 'questions' && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                layoutId="underline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleViewChange('analysis')}
            className={activeView === 'analysis' ? "text-primary" : "text-muted-foreground"}
          >
            Analysis
            {activeView === 'analysis' && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                layoutId="underline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </Button>
        </motion.div>
      </div>
      
      {/* View content with transitions */}
      <div className="min-h-[60vh] relative overflow-hidden">
        <AnimatePresence initial={false} custom={getDirection(activeView)}>
          {activeView === 'summary' && (
            <motion.div
              key="summary"
              custom={getDirection('summary')}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute w-full"
            >
              <Card className="border shadow-sm">
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
            </motion.div>
          )}
          
          {activeView === 'questions' && (
            <motion.div
              key="questions"
              custom={getDirection('questions')}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute w-full"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                  <CardDescription>Question breakdown</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[70vh] overflow-y-auto pb-24">
                  <DetailedQuestionsList questions={result.detailed_results || []} />
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {activeView === 'analysis' && (
            <motion.div
              key="analysis"
              custom={getDirection('analysis')}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute w-full"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Navigation indicators and arrows with animations */}
      <motion.div 
        className="flex justify-between mt-6 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              if (activeView === 'questions') handleViewChange('summary');
              else if (activeView === 'analysis') handleViewChange('questions');
            }}
            disabled={activeView === 'summary'}
            className="h-10 w-10 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </motion.div>
        
        <div className="flex gap-1">
          <motion.span 
            className={`h-2 w-2 rounded-full ${activeView === 'summary' ? 'bg-primary' : 'bg-gray-300'}`}
            animate={{ scale: activeView === 'summary' ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          ></motion.span>
          <motion.span 
            className={`h-2 w-2 rounded-full ${activeView === 'questions' ? 'bg-primary' : 'bg-gray-300'}`}
            animate={{ scale: activeView === 'questions' ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          ></motion.span>
          <motion.span 
            className={`h-2 w-2 rounded-full ${activeView === 'analysis' ? 'bg-primary' : 'bg-gray-300'}`}
            animate={{ scale: activeView === 'analysis' ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          ></motion.span>
        </div>
        
        <motion.div 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              if (activeView === 'summary') handleViewChange('questions');
              else if (activeView === 'questions') handleViewChange('analysis');
            }}
            disabled={activeView === 'analysis'}
            className="h-10 w-10 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
