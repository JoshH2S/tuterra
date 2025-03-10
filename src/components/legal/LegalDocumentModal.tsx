
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLegal } from "@/contexts/LegalContext";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { TermsOfUse } from "./TermsOfUse";

export function LegalDocumentModal() {
  const { isOpen, closeLegalDocument, currentDocument } = useLegal();

  return (
    <Dialog open={isOpen} onOpenChange={closeLegalDocument}>
      <DialogContent className="max-w-4xl h-[80vh] sm:h-[70vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">
            {currentDocument === "privacy" ? "Privacy Policy" : "Terms of Use"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="p-6 pt-2 h-full">
          {currentDocument === "privacy" ? <PrivacyPolicy /> : <TermsOfUse />}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
