
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  planId: "pro_plan" | "premium_plan";
  onSelect: (planId: "pro_plan" | "premium_plan") => void;
  buttonText: string;
  buttonDisabled?: boolean;
  isPopular?: boolean;
}

export const SubscriptionCard = ({
  title,
  price,
  description,
  features,
  planId,
  onSelect,
  buttonText,
  buttonDisabled = false,
  isPopular = false,
}: SubscriptionCardProps) => {
  return (
    <PremiumCard 
      variant={isPopular ? "gradient" : "default"}
      className={cn(
        "relative flex flex-col h-full overflow-hidden",
        isPopular ? "border-primary/50 shadow-md" : ""
      )}
      interactive
      hoverEffect={isPopular ? "lift" : "scale"}
    >
      {isPopular && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl">
            Popular
          </div>
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-extrabold">{price}</span>
          {price !== "$0" && (
            <span className="ml-1 text-sm text-muted-foreground">
              /{price.includes("95") || price.includes("191") ? "year" : "month"}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-foreground">What's included:</h4>
          <ul className="mt-2 space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <Button
            onClick={() => onSelect(planId)}
            disabled={buttonDisabled}
            className="w-full"
            variant={isPopular ? "default" : "outline"}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </PremiumCard>
  );
};
