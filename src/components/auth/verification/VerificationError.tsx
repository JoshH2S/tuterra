
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface VerificationErrorProps {
  error: string;
  onResend: () => void;
}

export const VerificationError = ({ error, onResend }: VerificationErrorProps) => {
  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Verification Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      
      <p className="text-gray-700">
        We couldn't verify your email. This could be because the verification link expired or was already used.
      </p>
      
      <div className="flex justify-center py-4">
        <Button onClick={onResend}>
          Resend Verification Email
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 text-center">
        If you continue having issues, please contact our support team.
      </p>
    </div>
  );
};
