
/**
 * Cleans and formats JSON content from LLM responses
 * @param content Raw content from OpenAI API
 * @returns Cleaned JSON string
 */
export function cleanupJSONContent(content: string): string {
  try {
    let cleaned = content;
    
    // Remove markdown and find JSON array
    cleaned = cleaned.replace(/```json\n|\n```|```/g, '');
    
    // Extract the JSON array
    const startBracket = cleaned.indexOf('[');
    const endBracket = cleaned.lastIndexOf(']');
    if (startBracket >= 0 && endBracket >= 0) {
      cleaned = cleaned.substring(startBracket, endBracket + 1);
    }
    
    // Fix quotes - more careful replacement
    cleaned = cleaned.replace(/=>"/g, ':"');  // Fix arrow syntax
    cleaned = cleaned.replace(/(\w)"(\w)/g, '$1\\"$2');  // Escape internal quotes
    cleaned = cleaned.replace(/([{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '$1"$3":');  // Fix property names
    
    // Remove problematic characters
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    cleaned = cleaned.replace(/\\n|\\r|\\t/g, ' ');
    
    // Fix trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    // Validate JSON structure
    try {
      JSON.parse(cleaned);
      return cleaned;
    } catch (parseError) {
      console.error("First parse attempt failed:", parseError.message);
      // If parsing fails, try more aggressive cleaning
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');  // Remove trailing commas
      cleaned = cleaned.replace(/\s+/g, ' ');  // Normalize whitespace
      return cleaned;
    }
  } catch (error) {
    console.error('Error in cleanupJSONContent:', error);
    throw error;
  }
}
