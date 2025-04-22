
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerificationSuccessProps {
  onContinue: () => void;
}

export const VerificationSuccess = ({ onContinue }: VerificationSuccessProps) => {
  return (
    <div className="space-y-6 text-center">
      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800">Email Verified!</h2>
      
      <p className="text-gray-600">
        Your email has been successfully verified. You can now continue to set up your profile.
      </p>
      
      <Button
        size="lg"
        className="px-8 w-full md:w-auto"
        onClick={onContinue}
      >
        Continue to Tuterra!
      </Button>
    </div>
  );
};
