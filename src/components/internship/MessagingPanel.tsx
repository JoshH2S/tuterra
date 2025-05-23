
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { format, isToday, isYesterday } from "date-fns";
import { InternshipMessage } from "./SwipeableInternshipView";
import { useState } from "react";

interface MessagingPanelProps {
  messages: InternshipMessage[];
}

export function MessagingPanel({ messages }: MessagingPanelProps) {
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  
  const toggleMessage = (messageId: string) => {
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage(messageId);
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };
  
  const getInitials = (name: string): string => {
    return name.split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <PremiumCard className="overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          {messages.length > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </span>
          )}
        </div>
        
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">No messages available</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {messages.map((message) => (
              <button
                key={message.id}
                className="w-full flex gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left touch-manipulation"
                onClick={() => toggleMessage(message.id)}
              >
                <Avatar>
                  <div className="bg-primary/20 text-primary w-full h-full flex items-center justify-center rounded-full">
                    {getInitials(message.sender)}
                  </div>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium text-sm truncate">{message.sender}</h4>
                    <span className="text-xs text-gray-500">{formatDate(message.sent_at)}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{message.subject}</p>
                  <p className="text-xs text-gray-500 truncate">{message.content.substring(0, 60)}...</p>
                </div>
              </button>
            ))}
          </div>
        )}
        
        <div className="flex justify-center">
          <Button className="w-full" variant="secondary">
            Go to Inbox
          </Button>
        </div>
        
        {/* Message modal for expanded view */}
        {expandedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setExpandedMessage(null)}>
            <div className="bg-card rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b">
                <h3 className="font-bold">{messages.find(m => m.id === expandedMessage)?.subject}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm">{messages.find(m => m.id === expandedMessage)?.sender}</span>
                  <span className="text-xs text-muted-foreground">
                    {messages.find(m => m.id === expandedMessage)?.sent_at && 
                     format(new Date(messages.find(m => m.id === expandedMessage)!.sent_at), "PPP p")}
                  </span>
                </div>
              </div>
              <div className="p-4 whitespace-pre-line">
                {messages.find(m => m.id === expandedMessage)?.content}
              </div>
              <div className="p-4 border-t flex justify-end">
                <Button variant="outline" onClick={() => setExpandedMessage(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat widget preview */}
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Quick Chat</h3>
            <span className="text-xs text-gray-500">Online</span>
          </div>
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            <p className="text-center text-gray-500 text-xs">
              Need help? Start a chat with your supervisor
            </p>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
