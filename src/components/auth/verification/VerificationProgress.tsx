
import { Loader2 } from "lucide-react";

interface VerificationProgressProps {
  verifying: boolean;
}

export const VerificationProgress = ({ verifying }: VerificationProgressProps) => {
  if (!verifying) return null;
  
  return (
    <div className="text-center py-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600">Verifying your email...</p>
    </div>
  );
};
