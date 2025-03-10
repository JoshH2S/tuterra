
import { useLegal } from "@/context/LegalContext";

interface PrivacyPolicyLinkProps {
  className?: string;
}

export const PrivacyPolicyLink = ({ className }: PrivacyPolicyLinkProps) => {
  const { openPrivacyPolicy } = useLegal();
  
  return (
    <button 
      onClick={openPrivacyPolicy}
      className={`text-primary hover:underline focus:outline-none ${className || ""}`}
    >
      Privacy Policy
    </button>
  );
};
