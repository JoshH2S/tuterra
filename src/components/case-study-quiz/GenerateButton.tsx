
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useSubscription } from "@/hooks/useSubscription";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isGenerating: boolean;
}

export const GenerateButton = ({ onClick, disabled, isGenerating }: GenerateButtonProps) => {
  const { credits, loading } = useUserCredits();
  const { subscription } = useSubscription();
  
  const isFreeUser = subscription.tier === 'free';
  const remainingCredits = !loading && credits ? credits.quiz_credits : 0;
  const tooltipText = loading 
    ? "Loading credit information..." 
    : `You have ${remainingCredits} free quiz ${remainingCredits === 1 ? 'credit' : 'credits'} remaining.`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={(e) => {
              // Prevent double clicks and ensure single click handling
              e.preventDefault();
              if (!disabled && !isGenerating) {
                console.log("Generate button clicked");
                onClick();
              }
            }}
            disabled={disabled || isGenerating}
            className="w-full touch-manipulation active:scale-95 transition-transform"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              'Generate Quiz'
            )}
          </Button>
        </TooltipTrigger>
        {isFreeUser && (
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
