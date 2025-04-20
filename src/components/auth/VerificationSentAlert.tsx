
import { Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface VerificationSentAlertProps {
  email: string;
  onResend: () => void;
  isResending: boolean;
}

export const VerificationSentAlert = ({
  email,
  onResend,
  isResending
}: VerificationSentAlertProps) => {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Mail className="h-5 w-5 text-blue-500" />
        <AlertDescription className="text-blue-800">
          <span className="font-medium block">Verification email sent!</span>
          Please check your inbox at <span className="font-bold">{email}</span> and click the verification link to activate your account.
        </AlertDescription>
      </Alert>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Haven't received the email?
        </p>
        <Button
          variant="outline"
          onClick={onResend}
          disabled={isResending}
          className="w-full"
        >
          {isResending ? "Sending..." : "Resend verification email"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Once verified, you can log in to continue with the onboarding process.
      </p>
    </div>
  );
};
