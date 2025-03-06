
import React from "react";
import { AlertTriangle } from "lucide-react";

interface InterviewDebugProps {
  sessionCreationErrors: string[];
}

export const InterviewDebug = ({ sessionCreationErrors }: InterviewDebugProps) => {
  if (sessionCreationErrors.length === 0) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4 shadow-sm">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h3 className="text-red-700 font-medium">Interview Setup Issues</h3>
          <ul className="text-sm text-red-600 mt-2 space-y-1">
            {sessionCreationErrors.map((err, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-1">•</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-red-500 mt-3">
            The system will use local fallback questions if possible. If the issue persists, please try again later 
            or refresh the page.
          </p>
        </div>
      </div>
    </div>
  );
};
