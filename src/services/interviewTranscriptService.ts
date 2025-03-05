
import { Message, Question } from "@/types/interview";
import { v4 as uuidv4 } from "@/lib/uuid";

export function createWelcomeMessage(role: string): Message {
  return {
    id: uuidv4(),
    role: 'ai',
    text: `Welcome to your interview for the ${role} position. I'll be asking you a series of questions to assess your fit for this role. Let's begin.`
  };
}

export function createUserResponseMessage(text: string): Message {
  return {
    id: uuidv4(),
    role: 'user',
    text
  };
}

export function createQuestionMessage(question: Question): Message {
  return {
    id: question.id,
    role: 'ai',
    text: question.text
  };
}

export function createCompletionMessage(): Message {
  return {
    id: uuidv4(),
    role: 'ai',
    text: "Thank you for completing the interview. I'm now analyzing your responses to provide feedback."
  };
}
