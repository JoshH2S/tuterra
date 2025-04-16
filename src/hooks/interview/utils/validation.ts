
import { z } from "zod";

// Define the schema for interview form validation
export const interviewSchema = z.object({
  industry: z.string().min(1, "Please select an industry"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(50, "Please provide a more detailed job description (at least 50 characters)")
});

// Export type based on the schema
export type InterviewFormData = z.infer<typeof interviewSchema>;

// Function to format job title for consistency
export const formatJobTitle = (title: string): string => {
  if (!title) return "";
  
  // Trim and ensure consistent capitalization
  return title.trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .replace(/^\w|\s\w/g, (match) => match.toUpperCase()); // Capitalize first letter of each word
};
