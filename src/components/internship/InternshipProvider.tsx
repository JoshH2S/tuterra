
import React from 'react';
import { InternshipContextProvider } from '@/hooks/internship';

export const InternshipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <InternshipContextProvider>{children}</InternshipContextProvider>;
};
