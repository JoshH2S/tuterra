
import React, { createContext, useContext, useState } from "react";
import { PrivacyPolicyModal } from "@/components/legal/PrivacyPolicyModal";
import { TermsOfServiceModal } from "@/components/legal/TermsOfServiceModal";

type LegalContextType = {
  openPrivacyPolicy: () => void;
  openTermsOfService: () => void;
};

const LegalContext = createContext<LegalContextType>({
  openPrivacyPolicy: () => {},
  openTermsOfService: () => {},
});

export const useLegal = () => useContext(LegalContext);

export const LegalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);
  const closePrivacyPolicy = () => setShowPrivacyPolicy(false);

  const openTermsOfService = () => setShowTermsOfService(true);
  const closeTermsOfService = () => setShowTermsOfService(false);

  return (
    <LegalContext.Provider 
      value={{ 
        openPrivacyPolicy, 
        openTermsOfService 
      }}
    >
      {children}
      <PrivacyPolicyModal 
        open={showPrivacyPolicy} 
        onClose={closePrivacyPolicy} 
      />
      <TermsOfServiceModal 
        open={showTermsOfService} 
        onClose={closeTermsOfService} 
      />
    </LegalContext.Provider>
  );
};
