
import { corsHeaders } from './constants.ts';

export async function generateQuestionsFromChunk(
  chunk: string,
  topics: { name: string; questionCount: number }[],
  openAIApiKey: string
): Promise<any> {
  console.log('Generating questions for chunk of size:', chunk.length);

  const prompt = `Generate multiple choice quiz questions from this content:
${chunk}

Generate questions for these topics:
${topics.map((topic, index) => `${index + 1}. ${topic.name} (${topic.questionCount} questions)`).join('\n')}

Each question MUST have exactly four options (A, B, C, D) and one correct answer. 
Format your response as a JSON array of question objects where each object has this EXACT structure:
{
  "question": "the question text",
  "options": {
    "A": "first option",
    "B": "second option",
    "C": "third option",
    "D": "fourth option"
  },
  "correct_answer": "A/B/C/D",
  "topic": "topic name"
}

IMPORTANT: Make sure your response is valid JSON that can be parsed. Do not include any explanatory text, ONLY the JSON array.`;

  try {
    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating focused multiple choice quiz questions. Always respond with valid JSON array containing question objects.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error response:', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData.error || 'Unknown error')}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('Raw OpenAI response content:', content);
    
    try {
      // Attempt to parse the content
      let parsedContent = JSON.parse(content);
      
      // If the content is wrapped in an additional object (due to response_format: json_object)
      // extract the questions array
      if (parsedContent.questions) {
        parsedContent = parsedContent.questions;
      }

      // Ensure we have an array
      if (!Array.isArray(parsedContent)) {
        console.error('Parsed content is not an array:', parsedContent);
        throw new Error('OpenAI response is not an array of questions');
      }
      
      // Validate the structure of each question
      parsedContent.forEach((q, index) => {
        if (!q.question || !q.options || !q.correct_answer || !q.topic) {
          console.error('Invalid question format at index', index, q);
          throw new Error(`Question at index ${index} is missing required fields`);
        }
        
        // Validate options structure
        if (!q.options.A || !q.options.B || !q.options.C || !q.options.D) {
          throw new Error(`Question at index ${index} is missing one or more options`);
        }
        
        // Validate correct_answer is valid
        if (!['A', 'B', 'C', 'D'].includes(q.correct_answer)) {
          throw new Error(`Question at index ${index} has invalid correct_answer: ${q.correct_answer}`);
        }
      });
      
      return parsedContent;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error(`Failed to parse quiz questions: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error generating questions from chunk:', error);
    throw error;
  }
}
