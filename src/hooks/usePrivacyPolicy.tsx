
import { createContext, useContext, useState, ReactNode } from "react";
import { PrivacyPolicyModal } from "@/components/legal/PrivacyPolicyModal";

interface PrivacyPolicyContextType {
  openPrivacyPolicy: () => void;
}

const PrivacyPolicyContext = createContext<PrivacyPolicyContextType | undefined>(undefined);

export const PrivacyPolicyProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openPrivacyPolicy = () => setIsOpen(true);
  const closePrivacyPolicy = () => setIsOpen(false);

  return (
    <PrivacyPolicyContext.Provider value={{ openPrivacyPolicy }}>
      {children}
      <PrivacyPolicyModal open={isOpen} onClose={closePrivacyPolicy} />
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
