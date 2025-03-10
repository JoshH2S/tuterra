
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  loading: boolean;
  disabled?: boolean; // Added disabled prop as optional
}

export const SubmitButton = ({ loading, disabled = false }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={loading || disabled}
      size="lg"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Creating account...</span>
        </span>
      ) : (
        "Create Account"
      )}
    </Button>
  );
};
