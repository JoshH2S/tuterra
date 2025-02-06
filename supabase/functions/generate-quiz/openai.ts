
import { corsHeaders } from './constants.ts';

interface Topic {
  name: string;
  questionCount: number;
}

export async function generateQuestionsWithOpenAI(
  content: string,
  topics: Topic[],
  openAIApiKey: string
): Promise<any[]> {
  console.log('Generating questions, content length:', content.length);
  
  const prompt = `Generate multiple choice quiz questions from this content:
${content}

Generate questions for these topics:
${topics.map((topic, index) => `${index + 1}. ${topic.name} (${topic.questionCount} questions)`).join('\n')}

Each question MUST have exactly four options (A, B, C, D) and one correct answer.
Format your response as a JSON array of questions, where each question has this structure:
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
}`;

  try {
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
            content: 'You are an expert at creating multiple choice quiz questions. Return a valid JSON array of questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received');

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    let questions;
    try {
      const parsed = JSON.parse(data.choices[0].message.content);
      questions = Array.isArray(parsed) ? parsed : parsed.questions;
      
      if (!Array.isArray(questions)) {
        throw new Error('Response does not contain a valid questions array');
      }
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Failed to parse questions from OpenAI response');
    }

    return questions;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}
