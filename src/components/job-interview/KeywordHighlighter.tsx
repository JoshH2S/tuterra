
import React, { useMemo } from "react";

interface KeywordHighlighterProps {
  text: string;
  keywords?: string[];
}

export const KeywordHighlighter = ({ text, keywords }: KeywordHighlighterProps) => {
  const highlightedText = useMemo(() => {
    if (!keywords || keywords.length === 0) return text;
    
    let result = text;
    
    // Sort keywords by length (descending) to handle longer phrases first
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    
    for (const keyword of sortedKeywords) {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      result = result.replace(regex, '<span class="text-primary font-medium">$1</span>');
    }
    
    return result;
  }, [text, keywords]);
  
  return (
    <p 
      className="leading-relaxed"
      dangerouslySetInnerHTML={{ __html: highlightedText }}
    />
  );
};
