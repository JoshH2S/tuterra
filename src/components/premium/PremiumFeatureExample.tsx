
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </FeatureLock>
  );
};
