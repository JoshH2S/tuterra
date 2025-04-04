
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorChatHeaderProps {
  isPremium?: boolean;
}

export const TutorChatHeader = ({ isPremium = false }: TutorChatHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      className="py-3 px-4 border-b sticky top-0 z-10 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 flex items-center gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Avatar className={cn("h-9 w-9", isMobile && "h-8 w-8")}>
        <AvatarFallback className={cn(
          "text-primary-foreground",
          isPremium ? "bg-amber-500" : "bg-primary"
        )}>
          <Bot className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-medium gradient-text">
            AI Study Assistant
          </h3>
          {isPremium && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <Sparkles className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isPremium 
            ? "Using advanced AI model with enhanced features" 
            : "Ask me anything about your studies"}
        </p>
      </div>
    </motion.div>
  );
};
