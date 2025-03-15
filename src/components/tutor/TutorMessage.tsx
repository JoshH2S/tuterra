
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Subscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/date-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cleanMarkdownFormatting } from "@/utils/markdown-cleaner";

interface TutorMessageProps {
  content: string;
  role: 'user' | 'assistant';
  subscription?: Subscription;
  isLastMessage?: boolean;
  timestamp: string;
}

export const TutorMessage = ({ 
  content, 
  role,
  subscription = { 
    tier: "free", 
    features: { 
      smartNotes: false, 
      advancedModel: false, 
      learningPath: false, 
      streaming: false 
    } 
  },
  isLastMessage = false,
  timestamp
}: TutorMessageProps) => {
  const isAssistant = role === 'assistant';
  const isMobile = useIsMobile();
  const isPremium = subscription.tier === "premium";
  
  // Clean up Markdown formatting for assistant messages
  const displayContent = isAssistant ? cleanMarkdownFormatting(content) : content;
  
  return (
    <motion.div 
      className={cn(
        "flex items-end gap-2",
        isAssistant ? "justify-start" : "justify-end"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isAssistant && (
        <Avatar className={cn("flex-shrink-0", isMobile ? "h-6 w-6" : "h-8 w-8")}>
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl shadow-sm",
            isAssistant 
              ? "bg-muted text-foreground rounded-tl-sm" 
              : "bg-primary text-primary-foreground rounded-tr-sm",
            subscription.tier !== "free" && "prose prose-sm max-w-none",
            isMobile ? "text-sm px-3 py-2" : ""
          )}
        >
          {isAssistant ? (
            <TextShimmer
              duration={subscription.tier === "premium" ? 1 : 1.5}
              className="whitespace-pre-wrap font-normal [--base-color:#1a1a1a] [--base-gradient-color:#757575] dark:[--base-color:#e0e0e0] dark:[--base-gradient-color:#ffffff]"
            >
              {displayContent}
            </TextShimmer>
          ) : (
            <p className="whitespace-pre-wrap">{displayContent}</p>
          )}
        </div>
        
        <div className={cn(
          "text-[10px] text-muted-foreground px-1",
          isAssistant ? "text-left" : "text-right"
        )}>
          {formatRelativeTime(new Date(timestamp))}
        </div>
      </div>
      
      {!isAssistant && (
        <Avatar className={cn("flex-shrink-0", isMobile ? "h-6 w-6" : "h-8 w-8")}>
          <AvatarFallback className="bg-primary/20 text-primary-foreground">
            <User className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};
