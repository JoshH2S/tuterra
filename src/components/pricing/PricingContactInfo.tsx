
import { PremiumContentCard } from "@/components/ui/premium-card";

export function PricingContactInfo() {
  return (
    <PremiumContentCard
      title="Questions about our plans?"
      description="Contact our support team for more information about which plan is right for you."
      variant="minimal"
      className="mt-12 max-w-3xl mx-auto text-center"
    >
      <div className="flex justify-center">
        <span className="text-base text-muted-foreground">
          Email us at{" "}
          <a href="mailto:support@tuterra.ai" className="text-primary underline">
            support@tuterra.ai
          </a>
        </span>
      </div>
    </PremiumContentCard>
  );
}
