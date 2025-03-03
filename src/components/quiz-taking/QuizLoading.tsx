
import React from "react";

export const QuizLoading: React.FC = () => {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md mb-6">
          <div className="h-2 bg-gray-200 rounded-full mb-6">
            <div className="h-2 bg-primary rounded-full animate-pulse" style={{ width: "60%" }}></div>
          </div>
          
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <p className="text-gray-600 mt-4">Loading quiz...</p>
      </div>
    </div>
  );
};
