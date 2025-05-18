
import { useContext } from 'react';
import { InternshipContext, InternshipContextType } from './InternshipContextProvider';

/**
 * Custom hook for accessing the Internship context
 */
export const useInternship = (): InternshipContextType => {
  console.log("🔄 useInternship: Hook called");
  const context = useContext(InternshipContext);
  
  if (context === undefined) {
    console.error("❌ useInternship: Hook used outside of InternshipProvider");
    throw new Error('useInternship must be used within an InternshipProvider');
  }
  
  console.log("✅ useInternship: Context successfully retrieved", { 
    hasSession: !!context.session,
    isLoading: context.loading,
    hasError: !!context.error,
    taskCount: context.tasks.length
  });
  
  return context;
};
