
/**
 * Cleans up the JSON content returned from the OpenAI API
 * @param content Raw content from API
 * @returns Cleaned JSON string
 */
export function cleanupJSONContent(content: string): string {
  try {
    // Log the original content for debugging
    console.log("Original content to clean up:", content.substring(0, 200) + "...");
    
    // Remove any markdown code block indicators
    let cleaned = content.replace(/```json/g, '').replace(/```/g, '');
    
    // Remove any explanatory text before or after the JSON array
    const jsonStart = cleaned.indexOf('[');
    const jsonEnd = cleaned.lastIndexOf(']');
    
    if (jsonStart >= 0 && jsonEnd >= 0) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      console.log("Extracted JSON array:", cleaned.substring(0, 100) + "...");
    } else {
      console.warn("Could not find JSON array brackets in content");
      
      // Try to find any JSON-like structure as a fallback
      const potentialJsonMatch = cleaned.match(/(\{.*\})/s);
      if (potentialJsonMatch && potentialJsonMatch[0]) {
        cleaned = `[${potentialJsonMatch[0]}]`;
        console.log("Extracted potential JSON object and wrapped in array");
      }
    }
    
    // Attempt to parse to validate JSON
    const parsedJson = JSON.parse(cleaned);
    
    // Ensure we have an array
    if (!Array.isArray(parsedJson)) {
      console.warn("Parsed content is not an array, wrapping in array");
      return JSON.stringify([parsedJson]);
    }
    
    return cleaned;
  } catch (error) {
    console.error("Error cleaning up JSON content:", error);
    console.log("Content that failed to parse:", content);
    
    // Advanced recovery attempt for malformed JSON
    try {
      // Try handling common JSON syntax errors
      let fixedContent = content
        .replace(/'/g, '"')                   // Replace single quotes with double quotes
        .replace(/,(\s*[\]}])/g, '$1')        // Remove trailing commas
        .replace(/(\w+):/g, '"$1":')          // Ensure property names are quoted
        .replace(/\n/g, ' ');                 // Remove newlines

      // Try to find anything that looks like a JSON object or array
      const objectMatch = fixedContent.match(/(\{.*\})/s);
      const arrayMatch = fixedContent.match(/(\[.*\])/s);
      
      if (arrayMatch && arrayMatch[0]) {
        console.log("Found array-like structure after fixing");
        fixedContent = arrayMatch[0];
      } else if (objectMatch && objectMatch[0]) {
        console.log("Found object-like structure after fixing, wrapping in array");
        fixedContent = `[${objectMatch[0]}]`;
      } else {
        throw new Error("Could not find valid JSON structure even after fixing");
      }
      
      // Validate again
      JSON.parse(fixedContent);
      return fixedContent;
    } catch (recoveryError) {
      console.error("Recovery attempt failed:", recoveryError);
      throw new Error(`Failed to clean up JSON content: ${error.message}. Recovery also failed.`);
    }
  }
}
