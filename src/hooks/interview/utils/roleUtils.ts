
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper function to determine the role category based on job role name
 */
export const getRoleCategory = (role: string): string => {
  const roleNormalized = role.toLowerCase();
  
  if (roleNormalized.includes('manager') || roleNormalized.includes('director') || roleNormalized.includes('lead')) {
    return 'management';
  } else if (roleNormalized.includes('engineer') || roleNormalized.includes('developer') || roleNormalized.includes('programmer')) {
    return 'development';
  } else if (roleNormalized.includes('analyst') || roleNormalized.includes('data')) {
    return 'analyst';
  } else if (roleNormalized.includes('design')) {
    return 'design';
  } else if (roleNormalized.includes('sales') || roleNormalized.includes('marketing')) {
    return 'sales';
  } else if (roleNormalized.includes('doctor') || roleNormalized.includes('nurse') || roleNormalized.includes('healthcare')) {
    return 'healthcare';
  } else if (roleNormalized.includes('finance') || roleNormalized.includes('accountant')) {
    return 'finance';
  }
  
  return 'any';
};

/**
 * Format job role for display by replacing hyphens and capitalizing words
 */
export const formatJobRole = (role: string): string => {
  return role
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
