
import { HelpCircle } from "lucide-react";
import { PrivacyPolicyLink } from "@/components/legal/PrivacyPolicyLink";
import { TermsOfServiceLink } from "@/components/legal/TermsOfServiceLink";

export const Footer = () => {
  return (
    <footer className="py-4 px-4 border-t text-center text-xs text-muted-foreground mt-auto">
      <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
        <PrivacyPolicyLink />
        <span className="hidden sm:inline">|</span>
        <TermsOfServiceLink />
        <span className="hidden sm:inline">|</span>
        <a href="#" className="text-primary hover:underline inline-flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          <span>Help</span>
        </a>
      </div>
    </footer>
  );
};
