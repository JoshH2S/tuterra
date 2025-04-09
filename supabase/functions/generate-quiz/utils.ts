
/**
 * Cleans up the JSON content returned from the OpenAI API
 * @param content Raw content from API
 * @returns Cleaned JSON string
 */
export function cleanupJSONContent(content: string): string {
  try {
    // Remove any markdown code block indicators
    let cleaned = content.replace(/```json/g, '').replace(/```/g, '');
    
    // Remove any explanatory text before or after the JSON array
    const jsonStart = cleaned.indexOf('[');
    const jsonEnd = cleaned.lastIndexOf(']');
    
    if (jsonStart >= 0 && jsonEnd >= 0) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    
    // Validate if valid JSON
    JSON.parse(cleaned);
    
    return cleaned;
  } catch (error) {
    console.error("Error cleaning up JSON content:", error);
    console.log("Original content:", content);
    throw new Error("Failed to clean up JSON content: " + error.message);
  }
}
