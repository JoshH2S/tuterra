
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/button";

interface SubscriptionCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  planId: string;
  isPopular?: boolean;
  onSelect: (planId: string) => void;
  buttonText: string;
  buttonDisabled?: boolean;
  buttonIcon?: React.ReactNode;
  customButtonVariant?: ButtonProps["variant"];
}

export function SubscriptionCard({
  title,
  price,
  description,
  features,
  planId,
  isPopular,
  onSelect,
  buttonText,
  buttonDisabled,
  buttonIcon,
  customButtonVariant,
}: SubscriptionCardProps) {
  return (
    <Card className={cn(
      "flex flex-col p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg border",
      isPopular && "border-primary ring-2 ring-primary ring-opacity-60"
    )}>
      <div className="flex-1">
        {isPopular && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary mb-4">
            Popular
          </span>
        )}
        
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="mt-4 text-sm text-muted-foreground">{description}</p>
        
        <div className="mt-4 flex items-baseline text-gray-900 dark:text-gray-100">
          <span className="text-4xl font-bold tracking-tight">{price}</span>
          {price !== "Custom pricing" && price !== "$0" && (
            <span className="ml-1 text-sm font-semibold text-muted-foreground">/month</span>
          )}
        </div>

        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex text-sm">
              <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
              <span className="ml-3">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={() => onSelect(planId)}
        disabled={buttonDisabled}
        className="mt-8"
        variant={customButtonVariant || "default"}
      >
        {buttonIcon && <span className="mr-2">{buttonIcon}</span>}
        {buttonText}
      </Button>
    </Card>
  );
}
