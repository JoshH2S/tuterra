
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfUse } from "@/components/legal/TermsOfUse";

export const Footer = () => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className="border-t py-4 bg-background mt-auto">
      <div className="container flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Tuterra. All rights reserved.
        </div>
        
        <div className="text-sm text-muted-foreground">
          A product of Maltech Solutions LLC
        </div>
        
        <div className="flex gap-4 sm:gap-6">
          <button
            onClick={() => setShowPrivacyPolicy(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setShowTerms(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          >
            Terms of Use
          </button>
        </div>
      </div>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogTitle>Privacy Policy</DialogTitle>
          <PrivacyPolicy />
        </DialogContent>
      </Dialog>

      {/* Terms of Use Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogTitle>Terms of Use</DialogTitle>
          <TermsOfUse />
        </DialogContent>
      </Dialog>
    </footer>
  );
};
