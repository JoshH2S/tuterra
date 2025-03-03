
import React from "react";

interface QuizErrorProps {
  error: Error | unknown;
}

export const QuizError: React.FC<QuizErrorProps> = ({ error }) => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
  
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-red-50 p-4 rounded-md border border-red-200">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Quiz</h2>
        <p className="text-sm text-red-600">{errorMessage}</p>
        <p className="text-sm text-gray-600 mt-4">Please try again later or contact support if this problem persists.</p>
      </div>
    </div>
  );
};
