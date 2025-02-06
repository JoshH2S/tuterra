
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating focused multiple choice quiz questions. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('Attempting to parse OpenAI response:', content.substring(0, 100) + '...');
    
    try {
      const questions = JSON.parse(content);
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      // Validate the structure of each question
      questions.forEach((q, index) => {
        if (!q.question || !q.options || !q.correct_answer || !q.topic) {
          console.error('Invalid question format at index', index, q);
          throw new Error(`Question at index ${index} is missing required fields`);
        }
      });
      
      return questions;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse quiz questions from OpenAI response');
    }
  } catch (error) {
    console.error('Error generating questions from chunk:', error);
    throw error;
  }
}

