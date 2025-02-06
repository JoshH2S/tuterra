
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
Return a JSON object with a 'questions' array where each question has this EXACT structure:
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
            content: 'You are an expert at creating multiple choice quiz questions. Return ONLY valid JSON containing a questions array.'
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
    console.log('OpenAI API response received');

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI');
    }

    let content = data.choices[0].message.content;
    console.log('Raw content before parsing:', content);

    try {
      // Parse the content
      const parsedContent = JSON.parse(content);
      
      // Extract questions array - it could be either directly an array or nested in a questions property
      let questions = Array.isArray(parsedContent) ? parsedContent : parsedContent.questions;
      
      if (!Array.isArray(questions)) {
        console.error('Parsed content does not contain a valid questions array:', parsedContent);
        throw new Error('OpenAI response does not contain a valid questions array');
      }

      // Validate each question
      questions.forEach((q, index) => {
        if (!q.question || !q.options || !q.correct_answer || !q.topic) {
          console.error(`Invalid question format at index ${index}:`, q);
          throw new Error(`Question at index ${index} is missing required fields`);
        }

        // Validate options
        const requiredOptions = ['A', 'B', 'C', 'D'];
        for (const opt of requiredOptions) {
          if (!q.options[opt]) {
            console.error(`Missing option ${opt} at index ${index}:`, q.options);
            throw new Error(`Question at index ${index} is missing option ${opt}`);
          }
        }

        // Validate correct_answer
        if (!['A', 'B', 'C', 'D'].includes(q.correct_answer)) {
          console.error(`Invalid correct_answer at index ${index}:`, q.correct_answer);
          throw new Error(`Question at index ${index} has invalid correct_answer: ${q.correct_answer}`);
        }
      });

      console.log(`Successfully validated ${questions.length} questions`);
      return questions;
    } catch (parseError) {
      console.error('Failed to parse or validate OpenAI response:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error(`Failed to parse quiz questions: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in generateQuestionsFromChunk:', error);
    throw error;
  }
}
