
// Functions for extracting requirements from job descriptions

// Extract key requirements from job description using OpenAI
export async function extractRequirements(role: string, industry: string, jobDescription: string): Promise<string[]> {
  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.warn("OpenAI API key not found, skipping requirements extraction");
      return [`Role: ${role}`, `Industry: ${industry}`];
    }

    const prompt = `
      Analyze this job description for a ${role} position in the ${industry} industry and extract key requirements:
      
      ${jobDescription}
      
      Return the response as a JSON array of strings containing only the 5-8 most important key requirements.
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
            content: "You are an expert at analyzing job requirements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("OpenAI requirements response:", data);
    
    try {
      const content = data.choices[0].message.content;
      console.log("Raw content from OpenAI:", content);
      
      // Clean the response to handle markdown code blocks
      const cleanedContent = cleanMarkdownCodeBlocks(content);
      console.log("Cleaned content:", cleanedContent);
      
      // Try to parse the cleaned content
      const parsedRequirements = JSON.parse(cleanedContent);
      
      if (Array.isArray(parsedRequirements) && parsedRequirements.length > 0) {
        return parsedRequirements;
      } else {
        console.warn("Failed to parse requirements from OpenAI response");
        return [`Role: ${role}`, `Industry: ${industry}`];
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      console.error("Response content was:", data.choices[0].message.content);
      return [`Role: ${role}`, `Industry: ${industry}`];
    }
  } catch (error) {
    console.error("Error extracting requirements:", error);
    return [`Role: ${role}`, `Industry: ${industry}`];
  }
}

/**
 * Cleans markdown code blocks from a string to extract pure JSON
 */
function cleanMarkdownCodeBlocks(content: string): string {
  // Case 1: Content is wrapped in ```json ... ``` markdown code block
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = content.match(jsonBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Case 2: No code blocks, just cleanup any trailing/leading whitespace
  return content.trim();
}

