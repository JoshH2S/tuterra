
import { AIFeedback, AnalysisData } from "./types.ts";

// Generate AI feedback based on quiz analysis
export function generateFeedback(analysisData: AnalysisData, overallScore: number): AIFeedback {
  const { topicResponses, difficultyResponses } = analysisData;
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];
  
  // Topic-based strengths (>=80% correct) and areas for improvement (<=60% correct)
  Object.entries(topicResponses).forEach(([topic, data]) => {
    const percentage = (data.correct / data.total) * 100;
    
    if (percentage >= 80) {
      // Be specific by mentioning the exact topic name and percentage
      strengths.push(`Strong understanding of ${topic} (${Math.round(percentage)}% correct)`);
    } else if (percentage <= 60) {
      // Be specific about which topics need improvement
      areasForImprovement.push(`Need to review ${topic} concepts (only ${Math.round(percentage)}% correct)`);
    }
  });

  // Only add difficulty-level insights if we have no topic-specific feedback
  if (strengths.length === 0 && areasForImprovement.length === 0) {
    // Difficulty-level insights
    Object.entries(difficultyResponses).forEach(([difficulty, data]) => {
      const percentage = (data.correct / data.total) * 100;
      
      if (percentage >= 80 && data.total >= 2) {
        strengths.push(`Excellent performance on ${difficulty}-level questions (${Math.round(percentage)}% correct)`);
      } else if (percentage <= 60 && data.total >= 2) {
        areasForImprovement.push(`Struggling with ${difficulty}-level questions (${Math.round(percentage)}% correct)`);
      }
    });
  }

  // If no specific topic strengths were identified but overall score is good
  if (strengths.length === 0) {
    if (overallScore >= 70) {
      strengths.push("Good overall performance across topics");
    } else if (overallScore >= 50) {
      strengths.push("Basic understanding of the subject matter");
    } else {
      strengths.push("Commitment to learning shown by attempting all questions");
    }
  }

  // If no specific topic weaknesses were identified
  if (areasForImprovement.length === 0) {
    if (overallScore < 70) {
      areasForImprovement.push("General review of core concepts recommended");
    } else if (overallScore < 90) {
      areasForImprovement.push("Review missed questions to achieve mastery");
    } else {
      areasForImprovement.push("Continue to reinforce your excellent knowledge");
    }
  }

  // Generate advice based on performance analysis and specific topics
  let advice = "";
  
  if (strengths.length > 0 && strengths[0].includes("Strong understanding")) {
    // Extract topic names from strengths for personalized advice
    const strongTopics = strengths
      .filter(s => s.includes("Strong understanding"))
      .map(s => s.split("Strong understanding of ")[1].split(" (")[0]);
    
    const topicsList = strongTopics.length > 1 
      ? strongTopics.slice(0, -1).join(", ") + " and " + strongTopics[strongTopics.length - 1]
      : strongTopics[0];
    
    advice = `Your strength in ${topicsList} is impressive! `;
  }
  
  if (areasForImprovement.length > 0 && areasForImprovement[0].includes("Need to review")) {
    // Extract topic names from areas for improvement for personalized advice
    const weakTopics = areasForImprovement
      .filter(a => a.includes("Need to review"))
      .map(a => a.split("Need to review ")[1].split(" concepts")[0]);
    
    const topicsList = weakTopics.length > 1 
      ? weakTopics.slice(0, -1).join(", ") + " and " + weakTopics[weakTopics.length - 1]
      : weakTopics[0];
    
    advice += `Focus on strengthening your knowledge of ${topicsList}. `;
  }
  
  // Add general advice based on overall score if we don't have specific topic advice
  if (advice === "") {
    if (overallScore >= 90) {
      advice = "Excellent work! To further enhance your knowledge, consider exploring advanced topics or helping peers understand these concepts.";
    } else if (overallScore >= 70) {
      advice = "Good job! Create flashcards for concepts you find challenging, and consider setting up regular study sessions to reinforce your knowledge.";
    } else if (overallScore >= 50) {
      advice = "You're on the right track! Create a study schedule focusing on the topics where you scored lower. Practice with additional questions.";
    } else {
      advice = "Don't get discouraged! Focus on mastering one topic at a time, starting with fundamentals. Establish a consistent study routine.";
    }
  } else {
    // Add study strategy suggestions based on overall score
    if (overallScore >= 90) {
      advice += "Consider exploring advanced materials or helping peers to further solidify your understanding.";
    } else if (overallScore >= 70) {
      advice += "Create flashcards for challenging concepts and set up regular review sessions.";
    } else if (overallScore >= 50) {
      advice += "Break down difficult concepts into smaller parts and practice with additional questions.";
    } else {
      advice += "Reach out to your instructor for additional support with these specific topics.";
    }
  }
  
  return {
    strengths,
    areas_for_improvement: areasForImprovement,
    advice
  };
}
