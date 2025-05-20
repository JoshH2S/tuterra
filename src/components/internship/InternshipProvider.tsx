
import React from 'react';
import { InternshipProvider as ContextProvider } from '@/hooks/useInternshipContext';

export const InternshipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ContextProvider>{children}</ContextProvider>;
};
