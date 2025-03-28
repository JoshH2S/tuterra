
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
  console.log(`Content split into chunks`);

  while (currentIndex < content.length) {
    // Calculate remaining content percentage
    const remainingContent = content.length - currentIndex;
    const contentPercentage = remainingContent / content.length;
    
    // Calculate questions for this chunk based on content percentage
    const questionsForChunk = Math.max(1, Math.ceil(contentPercentage * totalQuestions));
    
    // Distribute questions proportionally across topics
    const chunkTopics = topics.map(topic => {
      const topicPercentage = topic.numQuestions / totalQuestions;
      const topicQuestions = Math.max(1, Math.round(questionsForChunk * topicPercentage));
      return {
        description: topic.description,
        numQuestions: topicQuestions
      };
    });
    
    // Ensure we don't exceed the original requested number of questions
    let assignedQuestions = chunkTopics.reduce((sum, t) => sum + t.numQuestions, 0);
    if (assignedQuestions > questionsForChunk) {
      // Adjust the largest topic down if we allocated too many questions
      const largestTopic = chunkTopics.reduce(
        (max, topic) => topic.numQuestions > max.numQuestions ? topic : max, 
        chunkTopics[0]
      );
      largestTopic.numQuestions -= (assignedQuestions - questionsForChunk);
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
    console.log(`Processing chunk starting at index ${currentIndex} with topics: ${chunkTopics.map(t => t.description).join(', ')}`);
  }

  return chunks;
}
