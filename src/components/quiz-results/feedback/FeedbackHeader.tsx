
import { Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackHeaderProps {
  isGenerating?: boolean;
}

export function FeedbackHeader({ isGenerating = false }: FeedbackHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold flex items-center text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500`}>
      <Sparkles className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} mr-2 text-amber-500`} />
      AI Feedback
      {isGenerating && (
        <span className="ml-2 text-sm font-normal text-muted-foreground">(Generating...)</span>
      )}
    </h2>
  );
}
