
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIContextType {
  isLoading: boolean;
  processText: (text: string) => Promise<string>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder AI processing function
  const processText = async (text: string): Promise<string> => {
    setIsLoading(true);
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `Processed: ${text}`;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{ isLoading, processText }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
