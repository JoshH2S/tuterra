
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailedQuestionsList } from "./DetailedQuestionsList";
import { ScoreSummary } from "./ScoreSummary";
import { AdvancedAnalysisSection } from "@/components/skill-assessment/PremiumFeatures";

interface ResultsContentProps {
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

export const ResultsContent = ({ result, userTier, recommendations, benchmarks }: ResultsContentProps) => {
  return (
    <div className="md:grid md:grid-cols-3 gap-6">
      {/* Left column: Summary */}
      <div className="mb-6 md:mb-0">
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
      </div>
      
      {/* Right column: Details/Analysis */}
      <div className="md:col-span-2">
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="analysis">Advanced Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
                <CardDescription>Question by question breakdown</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <DetailedQuestionsList questions={result.detailed_results || []} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis">
            {/* Analysis content - now available to all users */}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
