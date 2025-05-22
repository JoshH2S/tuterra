import { ContentChunk, Question, QuestionDifficulty, ModelType } from "./types.ts";
import { generatePromptForChunk, containsSTEMTopics } from "./prompt-generator.ts";
import { cleanupJSONContent } from "./utils.ts";

/**
 * Selects the appropriate model based on content and available API keys
 */
function selectModelForChunk(
  chunk: ContentChunk, 
  openAIApiKey: string, 
  deepSeekApiKey: string | null, 
  preferredModel: string
): { modelType: ModelType, modelName: string } {
  // If user specified a model, try to use it
  if (preferredModel) {
    if (preferredModel.includes('deepseek') && deepSeekApiKey) {
      return { modelType: "deepseek", modelName: preferredModel };
    } else {
      return { modelType: "openai", modelName: preferredModel };
    }
  }
  
  // Otherwise use model selection logic
  if (containsSTEMTopics(chunk) && deepSeekApiKey) {
    console.log("Using DeepSeek model for STEM topics");
    return { modelType: "deepseek", modelName: "deepseek-coder" };
  }
  
  // Default to OpenAI
  console.log("Using OpenAI model");
  return { modelType: "openai", modelName: "gpt-3.5-turbo" };
}

/**
 * Shuffles the options of a quiz question while preserving the correct answer
 */
function shuffleQuestionOptions(question: Question): Question {
  if (!question.options || !question.correctAnswer) {
    return question;
  }

  // Store the correct answer text
  const correctAnswerText = question.options[question.correctAnswer];
  
  // Get all option entries and shuffle them
  const optionEntries = Object.entries(question.options);
  const shuffledEntries = [...optionEntries].sort(() => Math.random() - 0.5);
  
  // Create new options object with shuffled entries
  const shuffledOptions: Record<string, string> = {};
  shuffledEntries.forEach(([key, value], index) => {
    const newKey = String.fromCharCode(65 + index); // 'A', 'B', 'C', 'D'
    shuffledOptions[newKey] = value;
    
    // Update correct answer if this is the correct option
    if (value === correctAnswerText) {
      question.correctAnswer = newKey;
    }
  });
  
  // Return new question with shuffled options
  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: question.correctAnswer
  };
}

/**
 * Generates quiz questions by sending requests to AI APIs based on content type
 */
export async function generateQuizFromChunks(
  chunks: ContentChunk[], 
  difficulty: string,
  openAIApiKey: string,
  deepSeekApiKey: string | null = null,
  preferredModel: string = 'gpt-3.5-turbo',
  maxTokens: number = 2000
): Promise<{ 
  questions: Question[], 
  modelsUsed: Set<string>, 
  stemDetected: boolean,
  tokenUsage: number
}> {
  const allQuestions: Question[] = [];
  const modelsUsed = new Set<string>();
  let stemDetected = false;
  let processedChunks = 0;
  let totalTokensUsed = 0;
  
  // Track questions generated per topic
  const questionsPerTopic: Record<string, number> = {};

  for (const chunk of chunks) {
    try {
      console.log(`Processing chunk ${++processedChunks} of ${chunks.length}`);
      
      // Check if this chunk contains STEM topics
      const hasSTEM = containsSTEMTopics(chunk);
      if (hasSTEM) {
        stemDetected = true;
      }
      
      // Select the model to use for this chunk
      const { modelType, modelName } = selectModelForChunk(chunk, openAIApiKey, deepSeekApiKey, preferredModel);
      modelsUsed.add(modelName);
      
      // Generate the prompt
      const prompt = generatePromptForChunk(chunk, difficulty);
      
      let result;
      let chunkTokensUsed = 0;
      
      // Call the appropriate API based on the selected model
      if (modelType === "deepseek" && deepSeekApiKey) {
        result = await callDeepSeekAPI(prompt, deepSeekApiKey, modelName, maxTokens);
        // Estimate tokens for DeepSeek as they don't always return token counts
        chunkTokensUsed = Math.floor(prompt.length / 4) + Math.floor((result.choices[0]?.text?.length || 0) / 4);
      } else {
        result = await callOpenAIAPI(prompt, openAIApiKey, modelName, maxTokens);
        chunkTokensUsed = result.usage?.total_tokens || 0;
      }
      
      // Update token usage
      totalTokensUsed += chunkTokensUsed;
      console.log(`Chunk ${processedChunks} used approximately ${chunkTokensUsed} tokens`);
      
      if (!result.choices || !result.choices[0]) {
        console.error("Invalid response from AI API:", result);
        throw new Error("Invalid response from AI API");
      }
      
      const responseContent = modelType === "deepseek" 
        ? result.choices[0].text 
        : result.choices[0].message.content;
      
      const cleanedContent = cleanupJSONContent(responseContent);
      
      try {
        let questions = JSON.parse(cleanedContent);
        
        // Ensure we have an array
        if (!Array.isArray(questions)) {
          if (typeof questions === 'object' && questions !== null) {
            // Sometimes the API returns an object with questions array inside
            questions = questions.questions || [];
          } else {
            questions = [];
          }
        }
        
        console.log(`Successfully received response for chunk at index ${chunk.startIndex}`);
        
        // Add metadata about which model generated each question
        const questionsWithModelInfo = questions.map((q: Question) => ({
          ...q,
          generatedBy: modelName,
          mobileOptimized: true
        }));
        
        // Validate that we got the right number of questions for each topic
        const topicCounts: Record<string, number> = {};
        questionsWithModelInfo.forEach((q: Question) => {
          topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
          questionsPerTopic[q.topic] = (questionsPerTopic[q.topic] || 0) + 1;
        });
        
        console.log("Topic distribution in response:", topicCounts);
        console.log("Model used:", modelName);
        
        allQuestions.push(...questionsWithModelInfo);
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
  console.log(`Models used: ${Array.from(modelsUsed).join(', ')}`);
  console.log(`STEM topics detected: ${stemDetected}`);
  console.log(`Total tokens used: ${totalTokensUsed}`);
  
  // Shuffle options for all questions
  const shuffledQuestions = allQuestions.map(q => shuffleQuestionOptions(q));
  console.log(`Shuffled options for all ${shuffledQuestions.length} questions`);
  
  // Mobile-first optimization: ensure questions and options are concise
  const mobileOptimizedQuestions = shuffledQuestions.map(q => {
    // Ensure question text isn't too long for mobile
    let questionText = q.question;
    if (questionText.length > 300) {
      questionText = questionText.substring(0, 297) + "...";
    }
    
    // Ensure options aren't too long for mobile
    const optimizedOptions: Record<string, string> = {};
    Object.entries(q.options).forEach(([key, value]) => {
      let optionText = value;
      if (optionText.length > 100) {
        optionText = optionText.substring(0, 97) + "...";
      }
      optimizedOptions[key] = optionText;
    });
    
    return {
      ...q,
      question: questionText,
      options: optimizedOptions,
      mobileOptimized: true
    };
  });
  
  return { 
    questions: mobileOptimizedQuestions, 
    modelsUsed, 
    stemDetected,
    tokenUsage: totalTokensUsed
  };
}

/**
 * Calls the OpenAI API with the given prompt
 */
async function callOpenAIAPI(prompt: string, apiKey: string, model: string, maxTokens: number) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.3,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'system',
          content: 'Generate multiple-choice questions in valid JSON format. Each question must belong to one of the specified topics and follow the exact format requested. It is CRITICAL that you generate EXACTLY the number of questions requested for each topic - no more, no less. Optimize all questions and answers to be concise and mobile-friendly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
    }),
  });

  return await response.json();
}

/**
 * Calls the DeepSeek API with the given prompt
 */
async function callDeepSeekAPI(prompt: string, apiKey: string, model: string, maxTokens: number) {
  const response = await fetch('https://api.deepseek.com/v1/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      prompt: `Generate multiple-choice questions in valid JSON format for STEM subjects. Follow these instructions carefully: ${prompt}. Make all questions concise and mobile-friendly.`,
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });

  return await response.json();
}
