/**
 * Cleans Markdown formatting from text to make it more readable as plain text
 * 
 * @param text The text with potential Markdown formatting
 * @returns Clean, formatted text without Markdown symbols
 */
export function cleanMarkdownFormatting(text: string): string {
  if (!text) return "";
  
  let cleanText = text;
  
  // Remove code block formatting but preserve the code content
  cleanText = cleanText.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```[\w]*\n?|\n?```/g, "").trim();
  });
  
  // Remove inline code formatting but preserve code content
  cleanText = cleanText.replace(/`([^`]+)`/g, "$1");
  
  // Remove blockquote markers
  cleanText = cleanText.replace(/^>\s+/gm, "");
  cleanText = cleanText.replace(/^>\s*/gm, "");
  
  // Handle lists - convert Markdown lists to proper bullet points or numbers
  cleanText = cleanText.replace(/^\s*[-*+]\s+/gm, "• ");
  cleanText = cleanText.replace(/^\s*(\d+)\.?\s+/gm, "$1. ");
  
  // Remove bold/italic markers but preserve text
  cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, "$1"); // Bold
  cleanText = cleanText.replace(/__(.*?)__/g, "$1"); // Bold alternative
  cleanText = cleanText.replace(/\*(.*?)\*/g, "$1"); // Italic
  cleanText = cleanText.replace(/_(.*?)_/g, "$1"); // Italic alternative
  
  // Remove headers but keep text with proper spacing
  cleanText = cleanText.replace(/^#{1,6}\s+(.*)$/gm, "$1");
  
  // Ensure proper spacing after periods
  cleanText = cleanText.replace(/\.([A-Z])/g, ". $1");
  
  // Fix multiple consecutive spaces
  cleanText = cleanText.replace(/[ \t]+/g, " ");
  
  // Fix multiple consecutive line breaks
  cleanText = cleanText.replace(/\n{3,}/g, "\n\n");
  
  // Add smart formatting - ensure proper capitalization after periods
  cleanText = cleanText.replace(/\.\s+([a-z])/g, (match, letter) => 
    `. ${letter.toUpperCase()}`
  );
  
  // Remove any link formatting but keep the text
  cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  
  // Preserve HTML entity for bullet points (if they were encoded)
  cleanText = cleanText.replace(/&bull;/g, "•");
  
  return cleanText.trim();
}
