import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizDurationInput } from "@/components/quiz-generation/QuizDurationInput";
import { Question } from "@/types/quiz-generation";
import { QuizQuestionItem } from "@/components/quiz-generation/QuizQuestionItem";
import { QuizTitleInput } from "@/components/quiz-generation/QuizTitleInput";

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
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 py-4">
                <h3 className="font-medium">Question {index + 1}</h3>
                <p className="mt-2">{question.question}</p>
                <div className="mt-2 space-y-2">
                  {Object.entries(question.options).map(([key, value]) => (
                    <div key={key} className="flex items-start">
                      <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full border ${
                        question.correctAnswer === key ? 'bg-primary text-white border-primary' : 'border-gray-300'
                      }`}>
                        {key}
                      </div>
                      <span className="ml-2">{value}</span>
                    </div>
                  ))}
                </div>
                {isCaseStudyQuestion(question) && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Case Study:</span> {question.caseStudy}
                  </div>
                )}
              </div>
            ))}
            {questions.length > 3 && (
              <p className="text-center text-gray-500 mt-4">
                + {questions.length - 3} more questions
              </p>
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
  const topicCounts = questions.reduce((acc, question) => {
    acc[question.topic] = (acc[question.topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

const isCaseStudyQuestion = (question: any): question is CaseStudyQuestion => {
  return question.caseStudy !== undefined;
};
