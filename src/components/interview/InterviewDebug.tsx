
import React from "react";

interface InterviewDebugProps {
  sessionCreationErrors: string[];
}

export const InterviewDebug = ({ sessionCreationErrors }: InterviewDebugProps) => {
  if (sessionCreationErrors.length === 0) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
      <h3 className="text-red-700 font-medium">Debug Information</h3>
      <ul className="text-sm text-red-600 mt-2 space-y-1">
        {sessionCreationErrors.map((err, i) => (
          <li key={i}>• {err}</li>
        ))}
      </ul>
      <p className="text-xs text-red-500 mt-2">
        Please try again or refresh the page. If the problem persists, contact support.
      </p>
    </div>
  );
};
