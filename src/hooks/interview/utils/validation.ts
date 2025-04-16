
import { z } from "zod";

// Zod schema for interview form validation
export const interviewSchema = z.object({
  jobTitle: z.string()
    .min(2, "Job title must be at least 2 characters")
    .transform(val => val.trim()),
  industry: z.string()
    .min(2, "Industry must be at least 2 characters") 
    .transform(val => val.trim()),
  jobDescription: z.string()
    .min(50, "Job description should be at least 50 characters for better results")
    .transform(val => val.trim())
});

export type InterviewFormData = z.infer<typeof interviewSchema>;

// Consistent formatting function for job titles
export const formatJobTitle = (title: string): string => {
  if (!title) return "";
  
  return title
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Parameter types for API calls
export interface InterviewGenerationParams {
  jobTitle: string;
  industry: string;
  jobDescription: string;
  sessionId: string;
}
