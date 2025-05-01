
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface SubscriptionCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  planId: string;
  isPopular?: boolean;
  buttonText: string;
  onSelect: (planId: string) => void;
  buttonDisabled?: boolean;
  buttonIcon?: ReactNode;
  customButtonVariant?: string;
  showDowngradeButton?: boolean;
  onDowngrade?: () => void;
  subLabel?: string; // Added to support price sublabel display
}

export function SubscriptionCard({
  title,
  price,
  description,
  features,
  planId,
  isPopular = false,
  buttonText,
  onSelect,
  buttonDisabled = false,
  buttonIcon,
  customButtonVariant,
  showDowngradeButton = false,
  onDowngrade,
  subLabel, // New prop
}: SubscriptionCardProps) {
  const handleSelectClick = () => {
    onSelect(planId);
  };

  return (
    <Card 
      className={cn(
        "flex flex-col overflow-hidden border transition-all",
        isPopular 
          ? "border-primary shadow-md relative" 
          : "border-border"
      )}
    >
      {isPopular && (
        <div className="bg-primary px-3 py-1 text-primary-foreground text-sm absolute right-0 top-0 rounded-bl-lg font-medium">
          Popular
        </div>
      )}
      
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="mt-2 flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{price}</span>
          </div>
          {/* Display the sublabel if provided */}
          {subLabel && <span className="text-xs text-muted-foreground">{subLabel}</span>}
        </div>
        <CardDescription className="mt-1">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-primary mt-1" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          variant={customButtonVariant ? customButtonVariant as any : isPopular ? "default" : "outline"}
          disabled={buttonDisabled}
          onClick={handleSelectClick}
        >
          {buttonIcon}
          {buttonText}
        </Button>
        
        {showDowngradeButton && onDowngrade && (
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={onDowngrade}
          >
            Downgrade to Free
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
