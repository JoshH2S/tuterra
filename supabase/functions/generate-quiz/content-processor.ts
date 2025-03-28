
import { ContentChunk, Topic } from "./types.ts";
import { LIMITS } from "./config.ts";

/**
 * Splits content into manageable chunks with proportional topic distribution
 * @param content The full content to be processed
 * @param topics List of topics with question counts
 * @returns Array of content chunks
 */
export function splitContentIntoChunks(content: string, topics: Topic[]): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  let currentIndex = 0;

  // Calculate total questions requested
  const totalQuestions = topics.reduce((sum, t) => sum + t.numQuestions, 0);
  console.log(`Total questions requested: ${totalQuestions}`);
  
  // Track remaining questions for each topic
  const remainingQuestionsByTopic = new Map<string, number>();
  topics.forEach(topic => {
    remainingQuestionsByTopic.set(topic.description, topic.numQuestions);
  });
  
  console.log(`Topic distribution requested:`, Object.fromEntries(remainingQuestionsByTopic));

  while (currentIndex < content.length && Array.from(remainingQuestionsByTopic.values()).some(count => count > 0)) {
    // Calculate remaining content percentage
    const remainingContent = content.length - currentIndex;
    const contentPercentage = remainingContent / content.length;
    
    // Calculate max questions for this chunk
    const maxQuestionsForChunk = Math.max(1, Math.ceil(contentPercentage * totalQuestions));
    
    // Distribute questions proportionally across topics that still need questions
    const chunkTopics: Topic[] = [];
    
    // Only include topics that still have remaining questions
    topics.forEach(topic => {
      const remaining = remainingQuestionsByTopic.get(topic.description) || 0;
      if (remaining > 0) {
        // Calculate how many questions to assign to this topic in this chunk
        const topicPercentage = remaining / Array.from(remainingQuestionsByTopic.values()).reduce((sum, count) => sum + count, 0);
        let questionCount = Math.min(remaining, Math.max(1, Math.round(maxQuestionsForChunk * topicPercentage)));
        
        // Ensure we don't exceed remaining questions for this topic
        questionCount = Math.min(questionCount, remaining);
        
        chunkTopics.push({
          description: topic.description,
          numQuestions: questionCount
        });
        
        // Update remaining questions for this topic
        remainingQuestionsByTopic.set(topic.description, remaining - questionCount);
      }
    });
    
    // If all topics are done, break
    if (chunkTopics.length === 0) {
      break;
    }

    // Get chunk content
    const endIndex = Math.min(content.length, currentIndex + LIMITS.MAX_CHUNK_SIZE);
    let chunkContent = content.slice(currentIndex, endIndex);
    
    // Try to end at a sentence if possible
    if (endIndex < content.length) {
      const lastSentenceMatch = chunkContent.match(/[.!?][^.!?]*$/);
      if (lastSentenceMatch && lastSentenceMatch.index) {
        chunkContent = chunkContent.slice(0, lastSentenceMatch.index + 1);
      }
    }

    chunks.push({
      content: chunkContent,
      topics: chunkTopics,
      startIndex: currentIndex
    });

    currentIndex += chunkContent.length;
    console.log(`Processing chunk starting at index ${currentIndex} with topics:`, 
      chunkTopics.map(t => `${t.description} (${t.numQuestions} questions)`).join(', '));
  }

  console.log(`Content split into ${chunks.length} chunks`);
  return chunks;
}
