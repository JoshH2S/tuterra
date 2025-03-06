
import { Message, Question } from "@/types/interview";
import { v4 as uuidv4 } from "@/lib/uuid";

class InterviewTranscriptService {
  createWelcomeMessage(role: string): Message {
    return {
      id: uuidv4(),
      role: 'ai',
      text: `Welcome to your interview for the ${role} position. I'll be asking you a series of questions to assess your fit for this role. Let's begin.`
    };
  }

  createUserResponseMessage(text: string): Message {
    return {
      id: uuidv4(),
      role: 'user',
      text
    };
  }

  createQuestionMessage(question: Question): Message {
    return {
      id: question.id,
      role: 'ai',
      text: question.text
    };
  }

  createCompletionMessage(): Message {
    return {
      id: uuidv4(),
      role: 'ai',
      text: "Thank you for completing the interview. I'm now analyzing your responses to provide feedback."
    };
  }
}

// Export singleton instance
export const interviewTranscriptService = new InterviewTranscriptService();

// For backward compatibility
export function createWelcomeMessage(role: string): Message {
  return interviewTranscriptService.createWelcomeMessage(role);
}

export function createUserResponseMessage(text: string): Message {
  return interviewTranscriptService.createUserResponseMessage(text);
}

export function createQuestionMessage(question: Question): Message {
  return interviewTranscriptService.createQuestionMessage(question);
}

export function createCompletionMessage(): Message {
  return interviewTranscriptService.createCompletionMessage();
}
