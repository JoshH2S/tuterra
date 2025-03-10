
import { useLegal } from "@/context/LegalContext";

interface TermsOfServiceLinkProps {
  className?: string;
}

export const TermsOfServiceLink = ({ className }: TermsOfServiceLinkProps) => {
  const { openTermsOfService } = useLegal();
  
  return (
    <button 
      onClick={openTermsOfService}
      className={`text-primary hover:underline focus:outline-none ${className || ""}`}
    >
      Terms of Service
    </button>
  );
};
