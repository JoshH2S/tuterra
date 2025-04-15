
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to determine the role category based on job title name
 */
export const getRoleCategory = (title: string): string => {
  const titleNormalized = title.toLowerCase();
  
  if (titleNormalized.includes('manager') || titleNormalized.includes('director') || titleNormalized.includes('lead')) {
    return 'management';
  } else if (titleNormalized.includes('engineer') || titleNormalized.includes('developer') || titleNormalized.includes('programmer')) {
    return 'development';
  } else if (titleNormalized.includes('analyst') || titleNormalized.includes('data')) {
    return 'analyst';
  } else if (titleNormalized.includes('design')) {
    return 'design';
  } else if (titleNormalized.includes('sales') || titleNormalized.includes('marketing')) {
    return 'sales';
  } else if (titleNormalized.includes('doctor') || titleNormalized.includes('nurse') || titleNormalized.includes('healthcare')) {
    return 'healthcare';
  } else if (titleNormalized.includes('finance') || titleNormalized.includes('accountant')) {
    return 'finance';
  }
  
  return 'any';
};

/**
 * Format job title for display by replacing hyphens and capitalizing words
 */
export const formatJobRole = (title: string): string => {
  return title
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Fetches question templates from the database based on industry and role category
 */
export const fetchQuestionTemplates = async (industry: string, roleCategory: string) => {
  try {
    const { data: templates, error } = await supabase
      .from('question_templates')
      .select('*')
      .or(`industry.eq.${industry},industry.eq.general`)
      .or(`role_category.eq.${roleCategory},role_category.eq.any`)
      .limit(10);
      
    if (error) {
      console.error("Error fetching templates:", error);
      return null;
    }
    
    return templates;
  } catch (error) {
    console.error("Exception fetching templates:", error);
    return null;
  }
};
