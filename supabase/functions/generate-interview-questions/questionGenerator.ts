
import { EnhancedInterviewQuestion } from "./types.ts";
import { generateBasicInterviewQuestions } from "./fallbackQuestions.ts";

// Generate enhanced interview questions with OpenAI
export async function generateEnhancedQuestions(
  role: string, 
  industry: string, 
  requirements: string[], 
  jobDescription?: string
): Promise<EnhancedInterviewQuestion[]> {
  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.warn("OpenAI API key not found, using fallback question generation");
      return generateBasicInterviewQuestions(industry, role, jobDescription);
    }

    const questionPrompt = `
      Create an interview question set for a ${role} position in the ${industry} industry.
      
      Key Requirements:
      ${requirements.join('\n')}
      
      Additional context: ${jobDescription ? jobDescription.substring(0, 200) + "..." : "None provided"}
      
      Generate 8-10 questions with this distribution:
      - 3 Behavioral questions relevant to the role
      - 3-4 Technical/Role-specific questions based on the requirements
      - 2 Situational questions related to the industry
      - 1-2 Problem-solving questions
      
      For each question, provide:
      1. The main question text
      2. Category (behavioral/technical/role-specific/situational/problem-solving)
      3. Difficulty level (entry/intermediate/advanced)
      4. Expected topics to be covered in the answer (array of strings)
      5. 1-2 follow-up questions (array of strings)
      6. Estimated answer time in seconds (between 60-180)
      7. Keywords related to the question (array of strings)
      
      Ensure each question:
      - Directly relates to the job requirements
      - Cannot be answered with yes/no
      - Is specific to the role
      - Has clear assessment criteria
      - Progresses in difficulty within each category
      
      Return the response as a JSON array where each object has:
      {
        "text": "question text",
        "category": "one of the categories",
        "difficulty": "entry/intermediate/advanced",
        "estimatedTimeSeconds": number,
        "expectedTopics": ["topic1", "topic2"],
        "followUp": ["follow-up question 1", "follow-up question 2"],
        "keywords": ["keyword1", "keyword2"]
      }
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer with deep knowledge of industry-specific requirements."
          },
          {
            role: "user",
            content: questionPrompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("OpenAI questions response:", data);

    try {
      const content = data.choices[0].message.content;
      // Sometimes the API returns content with markdown code blocks
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const parsedQuestions = JSON.parse(cleanedContent);

      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        // Map to proper format and add required fields
        return parsedQuestions.map((q, index) => ({
          id: crypto.randomUUID(),
          text: q.text,
          category: q.category,
          difficulty: q.difficulty,
          estimatedTimeSeconds: q.estimatedTimeSeconds || 120,
          expectedTopics: q.expectedTopics || [],
          followUp: q.followUp || [],
          keywords: q.keywords || [],
          context: `${industry} - ${role}`,
          question_order: index,
          created_at: new Date().toISOString()
        }));
      } else {
        console.warn("Failed to parse questions from OpenAI response");
        return generateBasicInterviewQuestions(industry, role, jobDescription);
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI questions response:", parseError);
      return generateBasicInterviewQuestions(industry, role, jobDescription);
    }
  } catch (error) {
    console.error("Error generating enhanced questions:", error);
    return generateBasicInterviewQuestions(industry, role, jobDescription);
  }
}
