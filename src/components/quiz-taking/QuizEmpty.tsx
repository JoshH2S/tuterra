
import React from "react";

export const QuizEmpty: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <h2 className="text-lg font-semibold text-yellow-700 mb-2">Quiz Not Available</h2>
        <p className="text-sm text-yellow-600">This quiz has no questions or is not available.</p>
      </div>
    </div>
  );
};
