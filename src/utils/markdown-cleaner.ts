
export const cleanMarkdownFormatting = (text: string): string => {
  if (!text) return "";
  
  let cleanText = text;
  
  // Remove code blocks
  cleanText = cleanText.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/```[\w]*\n?|\n?```/g, "").trim();
  });
  
  // Remove blockquotes
  cleanText = cleanText.replace(/^>\s+/gm, "");
  cleanText = cleanText.replace(/^>\s*/gm, "");
  
  // Convert bullet points and numbered lists to plain text
  cleanText = cleanText.replace(/^\s*[-*+]\s+/gm, "• ");
  cleanText = cleanText.replace(/^\s*(\d+)\.?\s+/gm, "$1. ");
  
  // Remove formatting characters
  cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, "$1"); // Bold
  cleanText = cleanText.replace(/__(.*?)__/g, "$1"); // Bold alternative
  cleanText = cleanText.replace(/\*(.*?)\*/g, "$1"); // Italic
  cleanText = cleanText.replace(/_(.*?)_/g, "$1"); // Italic alternative
  
  // Remove headers
  cleanText = cleanText.replace(/^#{1,6}\s+(.*)$/gm, "$1");
  
  // Fix spacing after periods
  cleanText = cleanText.replace(/\.([A-Z])/g, ". $1");
  
  // Normalize whitespace
  cleanText = cleanText.replace(/[ \t]+/g, " ");
  
  // Normalize line breaks
  cleanText = cleanText.replace(/\n{3,}/g, "\n\n");
  
  return cleanText.trim();
};
