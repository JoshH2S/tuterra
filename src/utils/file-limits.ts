
/**
 * Centralized file size and content limits for the application
 */
export const FILE_LIMITS = {
  // File size limits
  MAX_FILE_SIZE_MB: 50, // Maximum file size in MB
  MAX_FILE_SIZE: 50 * 1024 * 1024, // Maximum file size in bytes (50MB)
  
  // Text content limits
  MAX_CHARACTERS: 50_000, // Hard maximum for text content (characters)
  WARNING_THRESHOLD: 25_000, // Warning threshold at 50% of maximum
  
  // Utility functions
  formatFileSize: (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
  
  estimateWords: (characters: number): number => {
    return Math.round(characters / 6); // Average English word is ~6 characters
  }
};

