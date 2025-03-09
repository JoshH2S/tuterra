
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Subscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

interface TutorMessageProps {
  content: string;
  role: 'user' | 'assistant';
  subscription?: Subscription;
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
  }
}: TutorMessageProps) => {
  const isAssistant = role === 'assistant';
  const isMobile = useIsMobile();
  
  return (
    <motion.div 
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} ${isMobile ? 'mb-2' : 'mb-3'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "max-w-[85%] p-3 rounded-lg",
          isAssistant
            ? "bg-gray-100 text-gray-900"
            : "bg-primary text-primary-foreground",
          subscription.tier !== "free" && "prose prose-sm max-w-none",
          isMobile ? "text-sm p-2.5" : ""
        )}
      >
        {isAssistant ? (
          <TextShimmer
            duration={subscription.tier === "premium" ? 1 : 1.5}
            className="whitespace-pre-wrap font-normal [--base-color:#1a1a1a] [--base-gradient-color:#757575] dark:[--base-color:#e0e0e0] dark:[--base-gradient-color:#ffffff]"
          >
            {content}
          </TextShimmer>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </motion.div>
  );
};
