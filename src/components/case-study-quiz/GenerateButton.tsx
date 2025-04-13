
import { Button } from "@/components/ui/button";
import { Loader2, WifiOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { useIsMobile } from "@/hooks/use-mobile";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isGenerating: boolean;
}

export const GenerateButton = ({ onClick, disabled, isGenerating }: GenerateButtonProps) => {
  const { credits, isOfflineMode } = useUserCredits();
  const { subscription } = useSubscription();
  const isMobile = useIsMobile();
  
  const isFreeUser = subscription.tier === 'free';
  const remainingCredits = credits?.quiz_credits || 0;

  // Don't show tooltip on mobile devices
  if (isMobile && isFreeUser) {
    return (
      <div className="space-y-2">
        <Button
          onClick={(e) => {
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
            <>
              {isOfflineMode && <WifiOff className="mr-2 h-4 w-4 text-amber-500" />}
              Generate Quiz
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          {isOfflineMode ? (
            "Offline mode - Using local credits"
          ) : (
            `You have ${remainingCredits} free quiz ${remainingCredits === 1 ? 'credit' : 'credits'} remaining.`
          )}
        </p>
      </div>
    );
  }

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
              <>
                {isOfflineMode && <WifiOff className="mr-2 h-4 w-4 text-amber-500" />}
                Generate Quiz
              </>
            )}
          </Button>
        </TooltipTrigger>
        {isFreeUser && (
          <TooltipContent>
            {isOfflineMode ? (
              <p>Offline mode - Using local credits</p>
            ) : (
              <p>You have {remainingCredits} free quiz {remainingCredits === 1 ? 'credit' : 'credits'} remaining.</p>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
