
export const isSTEMTopic = (topic: string): boolean => {
  const stemKeywords = [
    "math", "mathematics", "algebra", "calculus", "geometry", "trigonometry",
    "physics", "chemistry", "biology", "computer science", "cs", "programming",
    "engineering", "statistics", "probability", "economics", "data science",
    "machine learning", "artificial intelligence", "quantum", "algorithm"
  ];
  
  const lowerTopic = topic.toLowerCase();
  return stemKeywords.some(keyword => lowerTopic.includes(keyword));
};
