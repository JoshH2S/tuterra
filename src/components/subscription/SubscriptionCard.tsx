
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  planId: 'pro_plan' | 'premium_plan';
  isPopular?: boolean;
  className?: string;
  onSelect: (planId: 'pro_plan' | 'premium_plan') => void;
  buttonDisabled?: boolean;
  buttonText?: string;
}

export function SubscriptionCard({
  title,
  price,
  description,
  features,
  planId,
  isPopular = false,
  className,
  onSelect,
  buttonDisabled = false,
  buttonText = "Upgrade",
}: SubscriptionCardProps) {
  return (
    <Card className={cn(
      "flex flex-col overflow-hidden transition-all duration-200",
      isPopular && "border-primary shadow-md scale-[1.02]",
      className
    )}>
      <CardHeader className={cn(
        "flex flex-col space-y-1.5 p-6",
        isPopular && "bg-primary/10"
      )}>
        {isPopular && (
          <div className="mb-2 flex items-center">
            <Star className="mr-1 h-5 w-5 fill-primary text-primary" />
            <p className="text-xs font-semibold text-primary">MOST POPULAR</p>
          </div>
        )}
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold tracking-tight">{price}</span>
          <span className="ml-1 text-sm font-medium text-muted-foreground">/month</span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-1">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={() => onSelect(planId)} 
          className="w-full" 
          variant={isPopular ? "default" : "outline"}
          disabled={buttonDisabled}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
