
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
      strengths.push(`Strong understanding of ${topic} (${Math.round(percentage)}% correct)`);
    } else if (percentage <= 60) {
      areasForImprovement.push(`Need to review ${topic} concepts (only ${Math.round(percentage)}% correct)`);
    }
  });

  // Difficulty-level insights
  Object.entries(difficultyResponses).forEach(([difficulty, data]) => {
    const percentage = (data.correct / data.total) * 100;
    
    if (percentage >= 80 && data.total >= 2) {
      strengths.push(`Excellent performance on ${difficulty}-level questions (${Math.round(percentage)}% correct)`);
    } else if (percentage <= 60 && data.total >= 2) {
      areasForImprovement.push(`Struggling with ${difficulty}-level questions (${Math.round(percentage)}% correct)`);
    }
  });

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
    }
  }

  // Generate advice based on performance analysis
  let advice = "";
  
  if (overallScore >= 90) {
    advice = "Excellent work! To further enhance your knowledge, consider exploring advanced topics or helping peers understand these concepts. Review any questions you missed to ensure complete mastery of the subject.";
  } else if (overallScore >= 70) {
    advice = "Good job! Focus on strengthening the specific topics where you scored lower. Create flashcards for concepts you find challenging, and consider setting up regular study sessions to reinforce your knowledge.";
  } else if (overallScore >= 50) {
    advice = "You're on the right track! Create a study schedule focusing on the topics where you scored lower. Break down difficult concepts into smaller parts and practice with additional questions. Consider seeking help with the specific topics you're struggling with.";
  } else {
    advice = "Don't get discouraged! Focus on mastering one topic at a time, starting with fundamentals. Establish a consistent study routine and reach out to your instructor for additional support and resources for the specific topics you're struggling with.";
  }
  
  return {
    strengths,
    areas_for_improvement: areasForImprovement,
    advice
  };
}
