
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
  const { credits, permissionError } = useUserCredits();
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
            'Generate Quiz'
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          {permissionError && <WifiOff className="h-3 w-3 text-amber-500" />}
          You have {remainingCredits} free quiz {remainingCredits === 1 ? 'credit' : 'credits'} remaining
          {permissionError && " (offline mode)"}
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
              'Generate Quiz'
            )}
          </Button>
        </TooltipTrigger>
        {isFreeUser && (
          <TooltipContent>
            <div className="space-y-1">
              {permissionError && (
                <div className="text-xs text-amber-500 flex items-center gap-1 mb-1">
                  <WifiOff className="h-3 w-3" />
                  <span>Offline mode active</span>
                </div>
              )}
              <p>You have {remainingCredits} free quiz {remainingCredits === 1 ? 'credit' : 'credits'} remaining.</p>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
