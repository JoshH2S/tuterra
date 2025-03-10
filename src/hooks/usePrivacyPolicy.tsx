
import { createContext, useContext, useState, ReactNode } from "react";
import { PrivacyPolicyModal } from "@/components/legal/PrivacyPolicyModal";
import { TermsOfServiceModal } from "@/components/legal/TermsOfServiceModal";

interface PrivacyPolicyContextType {
  openPrivacyPolicy: () => void;
  openTermsOfService: () => void;
}

const PrivacyPolicyContext = createContext<PrivacyPolicyContextType | undefined>(undefined);

export const PrivacyPolicyProvider = ({ children }: { children: ReactNode }) => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const openPrivacyPolicy = () => setIsPrivacyOpen(true);
  const closePrivacyPolicy = () => setIsPrivacyOpen(false);
  
  const openTermsOfService = () => setIsTermsOpen(true);
  const closeTermsOfService = () => setIsTermsOpen(false);

  return (
    <PrivacyPolicyContext.Provider value={{ openPrivacyPolicy, openTermsOfService }}>
      {children}
      <PrivacyPolicyModal open={isPrivacyOpen} onClose={closePrivacyPolicy} />
      <TermsOfServiceModal open={isTermsOpen} onClose={closeTermsOfService} />
    </PrivacyPolicyContext.Provider>
  );
};

export const usePrivacyPolicy = () => {
  const context = useContext(PrivacyPolicyContext);
  if (context === undefined) {
    throw new Error("usePrivacyPolicy must be used within a PrivacyPolicyProvider");
  }
  return context;
};
