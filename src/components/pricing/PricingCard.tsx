
import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  title: string;
  price: string;
  period?: 'monthly' | 'yearly';
  description: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
  buttonText: string;
  buttonIcon?: React.ReactNode;
  customButtonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | null | undefined;
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  isPopular,
  onSelect,
  buttonText,
  buttonIcon,
  customButtonVariant,
}: PricingCardProps) {
  return (
    <div 
      className={`relative rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
        isPopular ? 'border-primary shadow-lg ring-1 ring-primary' : 'border-border'
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-6 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Popular
        </span>
      )}
      
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="mt-4 flex items-baseline text-gray-900 dark:text-gray-100">
        <span className="text-3xl font-bold tracking-tight">{price}</span>
        {period && (
          <span className="ml-1 text-sm text-muted-foreground">
            /{period}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      
      <ul className="mt-6 space-y-4">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        className="mt-8 w-full"
        variant={customButtonVariant || "default"}
        onClick={onSelect}
      >
        {buttonText}
        {buttonIcon && <span className="ml-2">{buttonIcon}</span>}
      </Button>
    </div>
  );
}
