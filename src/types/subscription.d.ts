
export type SubscriptionTier = "free" | "pro" | "premium";

export interface SubscriptionFeatures {
  analyticsAccess: boolean;
  advancedQuizzes: boolean;
  unlimitedMock: boolean;
  customLearningPlans: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  [key: string]: boolean;
}

export interface Subscription {
  tier: SubscriptionTier;
  features: SubscriptionFeatures;
  expiresAt?: string;
}
