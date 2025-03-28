
import { ContentChunk, Question, QuestionDifficulty } from "./types.ts";
import { generatePromptForChunk } from "./prompt-generator.ts";
import { cleanupJSONContent } from "./utils.ts";

/**
 * Generates quiz questions by sending requests to OpenAI API for each content chunk
 * @param chunks Array of content chunks
 * @param difficulty Target difficulty level
 * @param openAIApiKey OpenAI API key
 * @returns Array of generated questions
 */
export async function generateQuizFromChunks(
  chunks: ContentChunk[], 
  difficulty: string,
  openAIApiKey: string
): Promise<Question[]> {
  const allQuestions: Question[] = [];
  let processedChunks = 0;
  
  // Track questions generated per topic
  const questionsPerTopic: Record<string, number> = {};

  for (const chunk of chunks) {
    try {
      console.log(`Processing chunk ${++processedChunks} of ${chunks.length}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          temperature: 0.3,
          max_tokens: 2000,
          messages: [
            {
              role: 'system',
              content: 'Generate multiple-choice questions in valid JSON format. Each question must belong to one of the specified topics and follow the exact format requested. It is CRITICAL that you generate EXACTLY the number of questions requested for each topic - no more, no less.'
            },
            {
              role: 'user',
              content: generatePromptForChunk(chunk, difficulty)
            }
          ],
        }),
      });

      const result = await response.json();
      
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        console.error("Invalid response from OpenAI:", result);
        throw new Error("Invalid response from OpenAI");
      }
      
      const cleanedContent = cleanupJSONContent(result.choices[0].message.content);
      
      try {
        const questions = JSON.parse(cleanedContent);
        console.log(`Successfully received response for chunk at index ${chunk.startIndex}`);
        
        // Validate that we got the right number of questions for each topic
        const topicCounts: Record<string, number> = {};
        questions.forEach((q: Question) => {
          topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
          questionsPerTopic[q.topic] = (questionsPerTopic[q.topic] || 0) + 1;
        });
        
        console.log("Topic distribution in response:", topicCounts);
        allQuestions.push(...questions);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        console.error("Cleaned content that failed to parse:", cleanedContent);
        throw new Error(`Failed to parse questions: ${parseError.message}`);
      }
    } catch (error) {
      console.error(`Error processing chunk ${processedChunks}:`, error);
      throw error;
    }
  }

  console.log(`Generated a total of ${allQuestions.length} questions`);
  console.log(`Final distribution of questions by topic:`, questionsPerTopic);
  
  return allQuestions;
}
