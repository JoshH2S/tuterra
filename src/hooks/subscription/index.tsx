
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'pro' | 'premium';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isActive: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  // Default to free tier
  const [subscription] = useState<SubscriptionContextType>({
    tier: 'free',
    isActive: true
  });

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
