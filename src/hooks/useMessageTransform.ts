interface SupabaseMessage {
  id: string;
  content: string;
  role: string;
  conversation_id: string;
  created_at: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export const useMessageTransform = () => {
  const transformMessages = (messages: SupabaseMessage[]): Message[] => {
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role as 'user' | 'assistant' // This is safe because we control the values in the database
    }));
  };

  return { transformMessages };
};