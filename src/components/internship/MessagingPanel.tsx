
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";

// Mock messages
const messages = [
  {
    id: 1,
    sender: "Sarah Chen",
    avatar: "SC",
    subject: "Weekly Check-in",
    snippet: "Hi Alex, let's review your progress on the campaign analysis...",
    time: "10:45 AM",
  },
  {
    id: 2,
    sender: "Marcus Johnson",
    avatar: "MJ",
    subject: "Research Resources",
    snippet: "I found these market research tools that might help with your...",
    time: "Yesterday",
  },
  {
    id: 3,
    sender: "Team Notifications",
    avatar: "TN",
    subject: "New Design Assets Available",
    snippet: "The design team has uploaded new brand assets to the shared...",
    time: "May 20",
  },
];

export function MessagingPanel() {
  return (
    <PremiumCard className="overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
            3 new
          </span>
        </div>
        
        <div className="space-y-3 mb-4">
          {messages.map((message) => (
            <button
              key={message.id}
              className="w-full flex gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left touch-manipulation"
            >
              <Avatar>
                <div className="bg-primary/20 text-primary w-full h-full flex items-center justify-center rounded-full">
                  {message.avatar}
                </div>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-medium text-sm truncate">{message.sender}</h4>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-sm font-medium truncate">{message.subject}</p>
                <p className="text-xs text-gray-500 truncate">{message.snippet}</p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button className="w-full" variant="secondary">
            Go to Inbox
          </Button>
        </div>
        
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
