
import { PremiumContentCard } from "@/components/ui/premium-card";
import { FeatureLock } from "./FeatureLock";
import { useSubscription } from "@/hooks/useSubscription";

interface PremiumFeatureExampleProps {
  title: string;
  description: string;
  featureType: "quiz" | "interview" | "assessment" | "tutor";
  tier: "pro" | "premium";
  children: React.ReactNode;
}

export const PremiumFeatureExample = ({
  title,
  description,
  featureType,
  tier,
  children
}: PremiumFeatureExampleProps) => {
  const { subscription } = useSubscription();

  return (
    <FeatureLock 
      featureType={featureType} 
      tier={tier}
      userTier={subscription.tier}
    >
      <PremiumContentCard
        title={title}
        description={description}
        variant="elevated"
        className="w-full h-full"
      >
        {children}
      </PremiumContentCard>
    </FeatureLock>
  );
};
