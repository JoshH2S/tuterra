
import { AIFeedback, AnalysisData } from "./types.ts";

// Generate AI feedback based on quiz analysis
export function generateFeedback(analysisData: AnalysisData, overallScore: number): AIFeedback {
  const { topicResponses, difficultyResponses } = analysisData;
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];
  
  // Track if any topic-specific feedback was added
  let hasTopicSpecificStrengths = false;
  let hasTopicSpecificWeaknesses = false;
  
  console.log("Generating feedback with topic responses:", JSON.stringify(topicResponses));
  console.log("Overall score:", overallScore);
  
  // Topic-based strengths (>=80% correct) and areas for improvement (<70% correct)
  if (topicResponses && Object.keys(topicResponses).length > 0) {
    Object.entries(topicResponses).forEach(([topic, data]) => {
      // Skip entries with zero questions to avoid division by zero
      if (data.total === 0) return;
      
      const percentage = (data.correct / data.total) * 100;
      console.log(`Topic ${topic}: ${data.correct}/${data.total} = ${percentage}%`);
      
      if (percentage >= 80) {
        // Always include the topic name and exact percentage
        strengths.push(`Strong understanding of ${topic} (${Math.round(percentage)}% correct)`);
        hasTopicSpecificStrengths = true;
      } 
      
      // Dynamic feedback based on performance range
      if (percentage < 70) {
        if (percentage >= 50 && percentage < 70) {
          areasForImprovement.push(`Practice with more examples on ${topic} to solidify your understanding (${Math.round(percentage)}% correct)`);
        } 
        else if (percentage >= 30 && percentage < 50) {
          areasForImprovement.push(`Revisit the fundamentals of ${topic} - this appears to be a challenging area (${Math.round(percentage)}% correct)`);
        }
        else {
          areasForImprovement.push(`Focus on mastering the basic concepts of ${topic} - this is a priority area (${Math.round(percentage)}% correct)`);
        }
        
        hasTopicSpecificWeaknesses = true;
      }
    });
  } else {
    console.log("No topic responses found");
  }

  console.log("Topic-specific strengths identified:", hasTopicSpecificStrengths);
  console.log("Topic-specific weaknesses identified:", hasTopicSpecificWeaknesses);

  // Only add difficulty-level insights if we have no topic-specific feedback
  if (!hasTopicSpecificStrengths && difficultyResponses && Object.keys(difficultyResponses).length > 0) {
    // Difficulty-level insights
    Object.entries(difficultyResponses).forEach(([difficulty, data]) => {
      // Skip entries with zero questions
      if (data.total === 0) return;
      
      const percentage = (data.correct / data.total) * 100;
      
      if (percentage >= 80 && data.total >= 2) {
        strengths.push(`Excellent performance on ${difficulty}-level questions (${Math.round(percentage)}% correct)`);
      } 
    });
  }
  
  if (!hasTopicSpecificWeaknesses && difficultyResponses && Object.keys(difficultyResponses).length > 0) {
    // Add difficulty weakness feedback with dynamic ranges
    Object.entries(difficultyResponses).forEach(([difficulty, data]) => {
      // Skip entries with zero questions
      if (data.total === 0) return;
      
      const percentage = (data.correct / data.total) * 100;
      
      if (percentage < 70 && data.total >= 2) {
        if (percentage >= 50) {
          areasForImprovement.push(`Review more ${difficulty}-level questions to improve mastery (${Math.round(percentage)}% correct)`);
        } else {
          areasForImprovement.push(`Focus on building foundational knowledge for ${difficulty}-level questions (${Math.round(percentage)}% correct)`);
        }
      }
    });
  }

  // If no specific topic strengths were identified but overall score is good
  if (strengths.length === 0) {
    if (overallScore >= 80) {
      strengths.push(`Good overall performance across topics (${Math.round(overallScore)}% overall)`);
    } else if (overallScore >= 50) {
      strengths.push(`Basic understanding of the subject matter (${Math.round(overallScore)}% overall)`);
    } else {
      strengths.push(`Commitment to learning shown by attempting all questions (${Math.round(overallScore)}% overall)`);
    }
  }

  // If no specific topic weaknesses were identified
  if (areasForImprovement.length === 0) {
    if (overallScore < 70) {
      if (overallScore >= 50) {
        areasForImprovement.push(`Consider reviewing key concepts to strengthen your overall understanding (${Math.round(overallScore)}% overall)`);
      } else {
        areasForImprovement.push(`Revisit the core fundamentals to build a stronger foundation (${Math.round(overallScore)}% overall)`);
      }
    } else if (overallScore < 90) {
      areasForImprovement.push(`Review missed questions to achieve mastery (${Math.round(overallScore)}% overall)`);
    } else {
      areasForImprovement.push(`Continue to reinforce your excellent knowledge (${Math.round(overallScore)}% overall)`);
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
  
  // Extract weak topics for actionable advice
  const weakTopicsData: { topic: string, percentage: number }[] = [];
  if (topicResponses && Object.keys(topicResponses).length > 0) {
    Object.entries(topicResponses).forEach(([topic, data]) => {
      if (data.total === 0) return;
      const percentage = (data.correct / data.total) * 100;
      if (percentage < 70) {
        weakTopicsData.push({ topic, percentage });
      }
    });
  }
  
  // Sort weak topics by performance (lowest first)
  weakTopicsData.sort((a, b) => a.percentage - b.percentage);
  
  // Generate actionable advice for weak topics
  if (weakTopicsData.length > 0) {
    const topicsList = weakTopicsData.length > 1 
      ? weakTopicsData.slice(0, -1).map(t => t.topic).join(", ") + " and " + weakTopicsData[weakTopicsData.length - 1].topic
      : weakTopicsData[0].topic;
    
    advice += `Focus on strengthening your knowledge of ${topicsList}. `;
    
    // Add actionable next steps based on weakest topic
    const weakestTopic = weakTopicsData[0];
    
    if (weakestTopic.percentage < 50) {
      advice += `For ${weakestTopic.topic}, consider reviewing the fundamental concepts and principles first. Try creating flashcards for key terms and practicing with basic examples. `;
    } else {
      advice += `For ${weakestTopic.topic}, try working through practice problems of increasing difficulty and review your mistakes carefully. `;
    }
  }
  
  // Add general advice based on overall score if we don't have specific topic advice
  if (advice === "") {
    if (overallScore >= 90) {
      advice = `Excellent work! Your overall score of ${Math.round(overallScore)}% is outstanding. To further enhance your knowledge, consider exploring advanced topics or helping peers understand these concepts.`;
    } else if (overallScore >= 70) {
      advice = `Good job! Your overall score of ${Math.round(overallScore)}% shows solid understanding. Create flashcards for concepts you find challenging, and consider setting up regular study sessions to reinforce your knowledge.`;
    } else if (overallScore >= 50) {
      advice = `You're on the right track with a score of ${Math.round(overallScore)}%! Create a study schedule focusing on the topics where you scored lower. Practice with additional questions and consider forming a study group.`;
    } else {
      advice = `Don't get discouraged by your score of ${Math.round(overallScore)}%! Focus on mastering one topic at a time, starting with fundamentals. Establish a consistent study routine and consider seeking additional help from your instructor.`;
    }
  } else {
    // Add study strategy suggestions based on overall score
    if (overallScore >= 90) {
      advice += `With your overall score of ${Math.round(overallScore)}%, consider exploring advanced materials or helping peers to further solidify your understanding.`;
    } else if (overallScore >= 70) {
      advice += `With an overall score of ${Math.round(overallScore)}%, create flashcards for challenging concepts and set up regular review sessions.`;
    } else if (overallScore >= 50) {
      advice += `Your overall score is ${Math.round(overallScore)}%. Break down difficult concepts into smaller parts and practice with additional questions.`;
    } else {
      advice += `With your current score of ${Math.round(overallScore)}%, reach out to your instructor for additional support with these specific topics.`;
    }
  }
  
  // Log the final feedback for debugging
  console.log("Generated feedback:", { 
    strengths: strengths.length, 
    areas_for_improvement: areasForImprovement.length,
    hasAdvice: advice !== "" 
  });
  
  return {
    strengths,
    areas_for_improvement: areasForImprovement,
    advice
  };
}
