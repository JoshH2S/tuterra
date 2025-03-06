
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

export interface OpenAIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  enforceJsonFormat?: boolean;
}

export class OpenAIClient {
  async generateCompletion(request: OpenAIRequest): Promise<any> {
    console.log("Calling OpenAI API...");
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: request.systemPrompt || 'You are an expert AI interviewer. Respond ONLY with valid JSON arrays containing interview questions.'
            },
            { role: 'user', content: request.prompt }
          ],
          temperature: request.temperature || 0.7,
          response_format: request.enforceJsonFormat ? { type: "json_object" } : undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("OpenAI API error:", error);
        throw new Error(error.error?.message || 'OpenAI API error');
      }

      return response.json();
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      throw error;
    }
  }
}

export const openaiClient = new OpenAIClient();
