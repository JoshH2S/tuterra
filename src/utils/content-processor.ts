interface ProcessedContent {
  sections: {
    title: string;
    content: string;
  }[];
  keyTerms: string[];
  totalLength: number;
}

/**
 * Extracts key sections and important content from raw text
 * while removing unnecessary elements
 */
export const extractRelevantContent = (rawContent: string): ProcessedContent => {
  console.log('Processing content of length:', rawContent.length);
  
  // Split content into sections based on common heading patterns
  const sectionPattern = /(?:^|\n)(?:#{1,3}|[A-Z][A-Za-z\s]+:)\s*([^\n]+)/g;
  const sections: { title: string; content: string; }[] = [];
  let lastIndex = 0;
  let match;

  // Extract sections with their titles
  while ((match = sectionPattern.exec(rawContent)) !== null) {
    const startIndex = match.index;
    if (lastIndex < startIndex) {
      // Add content from last section
      if (sections.length > 0) {
        sections[sections.length - 1].content += rawContent.slice(lastIndex, startIndex).trim();
      }
    }
    
    sections.push({
      title: match[1].trim(),
      content: ''
    });
    
    lastIndex = startIndex + match[0].length;
  }

  // Add remaining content to last section
  if (sections.length > 0 && lastIndex < rawContent.length) {
    sections[sections.length - 1].content += rawContent.slice(lastIndex).trim();
  }

  // Extract key terms (definitions, important concepts)
  const keyTermPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?::|is|are|refers to|means)\s+([^.!?]+[.!?])/g;
  const keyTerms: string[] = [];
  let termMatch;
  
  while ((termMatch = keyTermPattern.exec(rawContent)) !== null) {
    keyTerms.push(termMatch[0].trim());
  }

  // Clean up sections
  const cleanedSections = sections.map(section => ({
    title: section.title,
    content: cleanContent(section.content)
  })).filter(section => section.content.length > 0);

  console.log('Extracted sections:', cleanedSections.length);
  console.log('Extracted key terms:', keyTerms.length);

  return {
    sections: cleanedSections,
    keyTerms,
    totalLength: cleanedSections.reduce((acc, section) => 
      acc + section.title.length + section.content.length, 0)
  };
};

/**
 * Cleans content by removing unnecessary elements and normalizing text
 */
const cleanContent = (content: string): string => {
  return content
    // Remove footnotes
    .replace(/\[\d+\]|\[note\s*\d*\]/gi, '')
    // Remove references
    .replace(/\((?:[^()]*\d{4}[^()]*)\)/g, '')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove empty parentheses
    .replace(/\(\s*\)/g, '')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    // Remove consecutive empty lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Estimates the number of tokens in a text string
 * This is a rough estimate based on GPT tokenization rules
 */
export const estimateTokenCount = (text: string): number => {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
};