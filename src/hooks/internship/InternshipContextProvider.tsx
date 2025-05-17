
import React from 'react';
import { InternshipProvider } from './useInternship';

export const InternshipContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <InternshipProvider>{children}</InternshipProvider>;
};
