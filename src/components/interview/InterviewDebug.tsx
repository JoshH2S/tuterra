
import React from "react";
import { AlertTriangle, WifiOff, KeySquare, Server, Database } from "lucide-react";

interface InterviewDebugProps {
  sessionCreationErrors: string[];
}

export const InterviewDebug = ({ sessionCreationErrors }: InterviewDebugProps) => {
  if (sessionCreationErrors.length === 0) return null;
  
  const hasConnectionError = sessionCreationErrors.some(err => 
    err.includes('connect') || err.includes('network') || err.includes('offline')
  );
  
  const hasSessionError = sessionCreationErrors.some(err => 
    err.includes('session') || err.includes('UUID') || err.includes('id')
  );
  
  const hasServerError = sessionCreationErrors.some(err =>
    err.includes('server') || err.includes('service') || err.includes('timeout')
  );
  
  const hasParameterError = sessionCreationErrors.some(err =>
    err.includes('parameter') || err.includes('missing') || err.includes('required') || 
    err.includes('invalid')
  );
  
  return (
    <div className="bg-red-50 border border-red-200 p-3 sm:p-4 rounded-md mb-4 shadow-sm">
      <div className="flex items-start">
        {hasConnectionError ? (
          <WifiOff className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
        ) : hasSessionError ? (
          <KeySquare className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
        ) : hasServerError ? (
          <Server className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
        ) : hasParameterError ? (
          <Database className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
        )}
        <div>
          <h3 className="text-red-700 font-medium text-sm sm:text-base">
            {hasConnectionError 
              ? "Connection Issues" 
              : hasSessionError 
                ? "Session Creation Issues" 
                : hasServerError
                  ? "Server Issues"
                  : hasParameterError
                    ? "Parameter Validation Issues"
                    : "Interview Setup Issues"}
          </h3>
          <ul className="text-xs sm:text-sm text-red-600 mt-2 space-y-1">
            {sessionCreationErrors.map((err, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-1">•</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-red-500 mt-3">
            {hasConnectionError 
              ? "The system is using local fallback questions. Your interview can continue offline." 
              : hasSessionError
                ? "The system had trouble creating your interview session. Using local fallback questions instead."
                : hasServerError
                  ? "There was an issue connecting to our question generation service. Using local fallback questions."
                  : hasParameterError
                    ? "There was an issue with the data sent to our question generation service. Using local fallback questions."
                    : "The system will use local fallback questions if possible. If the issue persists, please try again later or refresh the page."}
          </p>
          <div className="text-xs text-red-500 mt-2">
            <details className="cursor-pointer">
              <summary className="font-medium">Technical Details (for debugging)</summary>
              <pre className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 overflow-x-auto">
                {sessionCreationErrors.join('\n')}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};
