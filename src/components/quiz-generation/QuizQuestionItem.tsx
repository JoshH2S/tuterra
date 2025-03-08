
import { 
  Question, 
  CaseStudyQuestion, 
  isRegularQuestion, 
  isCaseStudyQuestion 
} from "@/types/quiz";
import { DifficultyBadge } from "./DifficultyBadge";
import { QuestionExplanation } from "./QuestionExplanation";
import { ExternalLink } from "lucide-react";

interface QuizQuestionItemProps {
  question: Question | CaseStudyQuestion;
  index: number;
}

export const QuizQuestionItem = ({ question, index }: QuizQuestionItemProps) => {
  // Ensure we have valid options object
  const options = question.options || { A: '', B: '', C: '', D: '' };
  
  // Use the type guards to safely check question types
  const isCaseStudy = isCaseStudyQuestion(question);
  
  // Function to format analysis type for display
  const formatAnalysisType = (type: string): string => {
    return type.replace(/_/g, ' ');
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <span className="font-medium min-w-[20px] text-right">{index + 1}.</span>
        <div className="flex-1">
          {/* Case Study Information */}
          {isCaseStudy && (
            <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Source: {question.caseStudy.source} • {question.caseStudy.date}
                </p>
                {question.caseStudy.url && (
                  <a 
                    href={question.caseStudy.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Source
                  </a>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {question.caseStudy.context}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-start gap-2 mb-2">
            <p className="font-medium flex-1">{question.question || 'No question text'}</p>
            <div className="flex flex-wrap gap-2">
              {isCaseStudy && (
                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 px-2 py-1 text-xs font-medium">
                  {formatAnalysisType(question.analysisType)}
                </span>
              )}
              {question.difficulty && (
                <DifficultyBadge difficulty={question.difficulty} />
              )}
            </div>
          </div>
          
          <div className="mt-3 space-y-2">
            {Object.entries(options).map(([letter, text]) => (
              <div key={letter} className="flex items-start gap-2 p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <span className="text-sm font-medium min-w-[20px]">{letter}.</span>
                <p className="text-sm">{text || 'No option text'}</p>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground mt-3 font-medium">
            Answer: {question.correctAnswer || 'Not specified'}
          </p>
          
          <QuestionExplanation explanation={question.explanation} />
          
          <div className="flex items-center flex-wrap gap-2 mt-3 text-sm text-muted-foreground">
            <span>Topic: {question.topic || 'General'}</span>
            <span className="hidden sm:inline">•</span>
            <span>{question.points || 1} points</span>
            
            {/* Only show concept information for regular questions */}
            {isRegularQuestion(question) && question.conceptTested && (
              <>
                <span className="hidden sm:inline">•</span>
                <span>Concept: {question.conceptTested}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
