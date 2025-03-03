
import React from "react";

export const QuizLoading: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    </div>
  );
};
