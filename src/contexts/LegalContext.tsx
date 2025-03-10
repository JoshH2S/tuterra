
import React, { createContext, useContext, useState } from "react";

type LegalDocumentType = "privacy" | "terms";

interface LegalContextType {
  openLegalDocument: (type: LegalDocumentType) => void;
  closeLegalDocument: () => void;
  isOpen: boolean;
  currentDocument: LegalDocumentType | null;
}

const LegalContext = createContext<LegalContextType | undefined>(undefined);

export function LegalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<LegalDocumentType | null>(null);

  const openLegalDocument = (type: LegalDocumentType) => {
    setCurrentDocument(type);
    setIsOpen(true);
  };

  const closeLegalDocument = () => {
    setIsOpen(false);
  };

  return (
    <LegalContext.Provider value={{ 
      openLegalDocument, 
      closeLegalDocument, 
      isOpen, 
      currentDocument 
    }}>
      {children}
    </LegalContext.Provider>
  );
}

export function useLegal() {
  const context = useContext(LegalContext);
  if (context === undefined) {
    throw new Error("useLegal must be used within a LegalProvider");
  }
  return context;
}
