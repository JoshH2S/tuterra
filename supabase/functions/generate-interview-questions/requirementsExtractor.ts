
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
      const parsedRequirements = JSON.parse(content);
      
      if (Array.isArray(parsedRequirements) && parsedRequirements.length > 0) {
        return parsedRequirements;
      } else {
        console.warn("Failed to parse requirements from OpenAI response");
        return [`Role: ${role}`, `Industry: ${industry}`];
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      return [`Role: ${role}`, `Industry: ${industry}`];
    }
  } catch (error) {
    console.error("Error extracting requirements:", error);
    return [`Role: ${role}`, `Industry: ${industry}`];
  }
}
