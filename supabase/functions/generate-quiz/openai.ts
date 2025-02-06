
import { corsHeaders } from './constants.ts';

export async function generateQuestionsFromChunk(
  chunk: string,
  topics: { name: string; questionCount: number }[],
  openAIApiKey: string
): Promise<any> {
  console.log('Generating questions for chunk of size:', chunk.length);

  const prompt = `Generate quiz questions from this content snippet:
${chunk}

Generate questions for these topics:
${topics.map((topic, index) => `${index + 1}. ${topic.name} (${topic.questionCount} questions)`).join('\n')}

Format each question as JSON with:
{
  "question": "question text",
  "options": {
    "A": "first option",
    "B": "second option",
    "C": "third option",
    "D": "fourth option"
  },
  "correct_answer": "A/B/C/D",
  "topic": "topic name"
}

Return an array of question objects.`;

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
            content: 'You are an expert at creating focused quiz questions from educational content.'
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
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating questions from chunk:', error);
    throw error;
  }
}
