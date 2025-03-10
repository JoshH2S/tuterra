
import { usePrivacyPolicy } from "@/hooks/usePrivacyPolicy";

interface PrivacyPolicyLinkProps {
  className?: string;
  linkText?: string;
}

export const PrivacyPolicyLink = ({ 
  className = "text-primary hover:underline cursor-pointer", 
  linkText = "Privacy Policy" 
}: PrivacyPolicyLinkProps) => {
  const { openPrivacyPolicy } = usePrivacyPolicy();

  return (
    <span 
      className={className} 
      onClick={openPrivacyPolicy}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          openPrivacyPolicy();
        }
      }}
    >
      {linkText}
    </span>
  );
};

interface TermsOfServiceLinkProps {
  className?: string;
  linkText?: string;
}

export const TermsOfServiceLink = ({ 
  className = "text-primary hover:underline cursor-pointer", 
  linkText = "Terms of Service" 
}: TermsOfServiceLinkProps) => {
  const { openTermsOfService } = usePrivacyPolicy();

  return (
    <span 
      className={className} 
      onClick={openTermsOfService}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          openTermsOfService();
        }
      }}
    >
      {linkText}
    </span>
  );
};
