
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizDurationInput } from "@/components/quiz-generation/QuizDurationInput";
import { Question, CaseStudyQuestion, isCaseStudyQuestion, isRegularQuestion } from "@/types/quiz-generation";
import { QuizQuestionItem } from "@/components/quiz-generation/QuizQuestionItem";
import { QuizTitleInput } from "@/components/quiz-generation/QuizTitleInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PreviewStepProps {
  title: string;
  setTitle: (title: string) => void;
  questions: Question[];
  duration: number;
  setDuration: (duration: number) => void;
  handleSubmit: () => void;
  isProcessing: boolean;
}

export const PreviewStep = ({ 
  title,
  setTitle,
  questions, 
  duration, 
  setDuration, 
  handleSubmit, 
  isProcessing 
}: PreviewStepProps) => {
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // Determine which questions to display based on showAllQuestions
  const displayQuestions = showAllQuestions ? questions : questions.slice(0, 5);
  const hiddenQuestionsCount = questions.length - 5;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Quiz Preview</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review and customize your quiz settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <QuizTitleInput 
            title={title}
            onChange={setTitle}
          />
          
          <QuizDurationInput 
            duration={duration}
            onChange={setDuration}
          />
        </CardContent>
      </Card>

      {questions.length > 0 ? (
        <div className="space-y-6">
          <QuizSummary questions={questions} />
          
          <div className="flex items-center space-x-2 py-2">
            <Checkbox 
              id="show-answers" 
              checked={showCorrectAnswers}
              onCheckedChange={(checked) => setShowCorrectAnswers(!!checked)}
            />
            <Label 
              htmlFor="show-answers" 
              className="text-sm font-medium cursor-pointer"
            >
              Show correct answers
            </Label>
          </div>
          
          <div className="space-y-4">
            {displayQuestions.map((question, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <h3 className="font-medium">Question {index + 1}</h3>
                    {question.difficulty && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {question.difficulty.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  
                  {/* Case Study Content (if applicable) */}
                  {isCaseStudyQuestion(question) && (
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
                            Source
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {question.caseStudy.context}
                      </p>
                    </div>
                  )}
                  
                  <p className="mt-2">{question.question}</p>
                  
                  <div className="mt-3 space-y-2">
                    {Object.entries(question.options).map(([key, value]) => (
                      <div 
                        key={key} 
                        className={`flex items-start gap-2 p-1.5 rounded-md ${
                          showCorrectAnswers && key === question.correctAnswer
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <span className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full border ${
                          showCorrectAnswers && key === question.correctAnswer ? 'bg-green-500 text-white border-green-500' : 'border-gray-300'
                        }`}>
                          {key}
                        </span>
                        <span className="ml-2">{value}</span>
                        {showCorrectAnswers && key === question.correctAnswer && (
                          <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">
                            Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Question type specific details */}
                  <div className="mt-3 text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                    <span>Topic: {question.topic}</span>
                    <span>Points: {question.points}</span>
                    
                    {isRegularQuestion(question) && question.conceptTested && (
                      <span>Concept: {question.conceptTested}</span>
                    )}
                    
                    {isCaseStudyQuestion(question) && question.analysisType && (
                      <span>Analysis: {question.analysisType.replace(/_/g, ' ')}</span>
                    )}
                  </div>
                  
                  {/* Show explanation only when answers are visible */}
                  {showCorrectAnswers && question.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-900/30">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Explanation:</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{question.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Show "See More" button only if there are more than 5 questions */}
            {questions.length > 5 && (
              <div className="flex flex-col items-center mt-4">
                <p className="text-center text-gray-500 mb-2">
                  {showAllQuestions ? 'Showing all questions' : `+ ${hiddenQuestionsCount} more question${hiddenQuestionsCount !== 1 ? 's' : ''}`}
                </p>
                <Button 
                  onClick={() => setShowAllQuestions(!showAllQuestions)} 
                  variant="outline"
                  size="sm"
                >
                  {showAllQuestions ? 'Show Less' : 'Show All Questions'}
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card className="bg-gray-50 dark:bg-gray-800/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <h3 className="text-lg font-medium mb-2">
              No Questions Generated Yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Complete the previous steps and generate your quiz to see a preview of the questions
            </p>
            <Button 
              onClick={handleSubmit} 
              disabled={isProcessing}
              className="w-full md:w-auto"
            >
              {isProcessing ? 'Generating...' : 'Generate Quiz'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface QuizSummaryProps {
  questions: Question[];
}

const QuizSummary = ({ questions }: QuizSummaryProps) => {
  // Get count of questions by topic
  const topicCounts = questions.reduce((acc, question) => {
    acc[question.topic] = (acc[question.topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Count question types
  const caseStudyCount = questions.filter(isCaseStudyQuestion).length;
  const regularCount = questions.filter(isRegularQuestion).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Questions:</span>
            <span className="font-medium">{questions.length}</span>
          </div>
          
          {/* Show question type breakdown if both types exist */}
          {caseStudyCount > 0 && regularCount > 0 && (
            <>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Case Study Questions:</span>
                <span>{caseStudyCount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Regular Questions:</span>
                <span>{regularCount}</span>
              </div>
            </>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
          
          {Object.entries(topicCounts).map(([topic, count]) => (
            <div key={topic} className="flex justify-between">
              <span>{topic}:</span>
              <span className="font-medium">{count} questions</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
