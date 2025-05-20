
import { useContext } from 'react';
import { InternshipContext } from './InternshipContextProvider';

/**
 * Custom hook for accessing the Internship context
 */
export const useInternship = () => {
  const context = useContext(InternshipContext);
  if (context === undefined) {
    throw new Error('useInternship must be used within an InternshipProvider');
  }
  return context;
};
