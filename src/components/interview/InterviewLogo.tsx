
import React from 'react';

export const InterviewLogo = () => {
  return (
    <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8">
      <div className="flex items-center space-x-2">
        <div className="bg-primary/90 text-white p-2 sm:p-3 rounded-lg flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-6 h-6 sm:w-7 sm:h-7"
          >
            <path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
            <circle cx="18" cy="18" r="3" />
            <path d="M18 14.3V18l1.8 1.2" />
          </svg>
        </div>
        <div className="text-foreground">
          <h1 className="font-bold text-lg sm:text-xl gradient-text">Interview Simulator</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Professional interview practice</p>
        </div>
      </div>
    </div>
  );
};
