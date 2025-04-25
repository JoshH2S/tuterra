
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, MoveRight, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header1 } from "@/components/ui/header";

// Define types for pricing data
type FeatureItem = {
  name: string;
  included: boolean | string;
};

type PricingTier = {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: FeatureItem[];
  highlight: boolean;
  icon: React.ReactNode;
  buttonText: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
};

const defaultTiers: PricingTier[] = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started",
    features: [
      { name: "Basic AI Assistant", included: true },
      { name: "Message Credits", included: "10 messages/day" },
      { name: "Basic Support", included: true },
      { name: "Smart Notes", included: false },
      { name: "Learning Path", included: false },
      { name: "Advanced Model", included: false },
    ],
    highlight: false,
    icon: <Zap className="w-7 h-7 text-primary" />,
    buttonText: "Get started",
    buttonIcon: <MoveRight className="w-4 h-4" />,
    buttonVariant: "outline"
  },
  {
    name: "Pro",
    price: { monthly: 19.99, yearly: 16.99 },
    description: "For serious students and educators",
    features: [
      { name: "Advanced AI Assistant", included: true },
      { name: "Message Credits", included: "Unlimited" },
      { name: "Priority Support", included: true },
      { name: "Smart Notes", included: true },
      { name: "Learning Path", included: true },
      { name: "Advanced Model", included: false },
    ],
    highlight: true,
    icon: <Zap className="w-7 h-7 text-primary" />,
    buttonText: "Subscribe",
    buttonIcon: <MoveRight className="w-4 h-4" />,
    buttonVariant: "default"
  },
  {
    name: "Premium",
    price: { monthly: 39.99, yearly: 33.99 },
    description: "Complete solution for institutions",
    features: [
      { name: "Enterprise AI Assistant", included: true },
      { name: "Message Credits", included: "Unlimited" },
      { name: "Dedicated Support", included: true },
      { name: "Smart Notes", included: true },
      { name: "Learning Path", included: true },
      { name: "Advanced Model", included: true },
    ],
    highlight: false,
    icon: <Zap className="w-7 h-7 text-primary" />,
    buttonText: "Contact sales",
    buttonIcon: <MoveRight className="w-4 h-4" />,
    buttonVariant: "secondary"
  },
];

const PricingCard = ({ tier, isYearly }: { tier: PricingTier; isYearly: boolean }) => {
  const price = isYearly ? tier.price.yearly : tier.price.monthly;
  const formattedPrice = price === 0 ? "Free" : `$${price}`;
  
  return (
    <Card className={cn(
      "flex flex-col h-full transition-all duration-200 hover:shadow-lg",
      tier.highlight ? "border-primary shadow-md" : ""
    )}>
      <CardHeader>
        {tier.highlight && (
          <Badge className="w-fit mb-2 bg-gradient-to-r from-primary-300 to-primary-400 text-black">
            Most Popular
          </Badge>
        )}
        <div className="flex items-center justify-between">
          <CardTitle>{tier.name}</CardTitle>
          {tier.icon}
        </div>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mt-2 mb-6">
          <span className="text-3xl font-bold">{formattedPrice}</span>
          {price > 0 && <span className="text-muted-foreground ml-1">/month</span>}
          {isYearly && price > 0 && (
            <div className="mt-1">
              <Badge variant="outline" className="bg-primary-100/50 text-xs">
                Save {Math.round(((tier.price.monthly * 12) - (tier.price.yearly * 12)) / (tier.price.monthly * 12) * 100)}%
              </Badge>
            </div>
          )}
        </div>
        <ul className="space-y-2">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              {feature.included ? (
                <Check className="w-5 h-5 text-primary shrink-0" />
              ) : (
                <X className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <span className="text-sm">
                {typeof feature.included === 'string' ? `${feature.name}: ${feature.included}` : feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          variant={tier.buttonVariant || "default"} 
          className={cn("w-full group gap-1", 
            tier.highlight ? "bg-gradient-to-br from-primary-100 to-primary-300 text-black hover:from-primary-200 hover:to-primary-400" : ""
          )}
        >
          {tier.buttonText}
          {tier.buttonIcon && (
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              {tier.buttonIcon}
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

const ComparisonTable = ({ tiers, isYearly }: { tiers: PricingTier[]; isYearly: boolean }) => {
  // Get all unique features
  const allFeatures = Array.from(
    new Set(tiers.flatMap(tier => tier.features.map(feature => feature.name)))
  );
  
  return (
    <div className="w-full overflow-x-auto pb-6">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left py-4 px-4"></th>
            {tiers.map((tier) => (
              <th key={tier.name} className="text-left py-4 px-4">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">{tier.name}</span>
                  <span className="text-2xl font-bold">
                    {isYearly ? `$${tier.price.yearly}` : `$${tier.price.monthly}`}
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((featureName) => (
            <tr key={featureName} className="border-t">
              <td className="py-4 px-4 font-medium">{featureName}</td>
              {tiers.map((tier) => {
                const feature = tier.features.find(f => f.name === featureName);
                return (
                  <td key={`${tier.name}-${featureName}`} className="py-4 px-4">
                    {feature ? (
                      typeof feature.included === 'string' ? (
                        <span>{feature.included}</span>
                      ) : feature.included ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground" />
                      )
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-t">
            <td className="py-4 px-4"></td>
            {tiers.map((tier) => (
              <td key={`${tier.name}-action`} className="py-4 px-4">
                <Button 
                  variant={tier.buttonVariant || "default"} 
                  className={cn("w-full group gap-1", 
                    tier.highlight ? "bg-gradient-to-br from-primary-100 to-primary-300 text-black hover:from-primary-200 hover:to-primary-400" : ""
                  )}
                >
                  {tier.buttonText}
                  {tier.buttonIcon && (
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {tier.buttonIcon}
                    </span>
                  )}
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const PricingSection = ({ className }: { className?: string }) => {
  const [isYearly, setIsYearly] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'cards' | 'comparison'>('cards');
  
  return (
    <section className={cn("py-12 px-4 md:py-24", className)} id="pricing">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="mb-4 bg-primary-100/80 text-primary-600">Pricing</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">
            Choose the perfect plan for your needs. Always know what you'll pay.
          </p>
          
          <div className="mt-8 flex justify-center gap-8">
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('cards')}
                className={cn(
                  "px-3 py-1 rounded-md transition-colors",
                  viewMode === 'cards' ? "bg-card shadow-sm" : "hover:bg-muted"
                )}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={cn(
                  "px-3 py-1 rounded-md transition-colors",
                  viewMode === 'comparison' ? "bg-card shadow-sm" : "hover:bg-muted"
                )}
              >
                Comparison
              </button>
            </div>
            
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
              <button
                onClick={() => setIsYearly(false)}
                className={cn(
                  "px-3 py-1 rounded-md transition-colors",
                  !isYearly ? "bg-card shadow-sm" : "hover:bg-muted"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={cn(
                  "px-3 py-1 rounded-md transition-colors",
                  isYearly ? "bg-card shadow-sm" : "hover:bg-muted"
                )}
                aria-label="Toggle yearly billing"
              >
                Yearly <span className="text-xs text-primary">-16%</span>
              </button>
            </div>
          </div>
        </div>
        
        {viewMode === 'cards' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {defaultTiers.map((tier) => (
              <PricingCard key={tier.name} tier={tier} isYearly={isYearly} />
            ))}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <ComparisonTable tiers={defaultTiers} isYearly={isYearly} />
          </div>
        )}
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Need a custom plan for your organization? <br className="md:hidden" />
            Contact our sales team for more information.
          </p>
          <Button variant="outline" className="gap-2">
            Contact Sales <MoveRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

const LandingPagePricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header1 />
      
      <main className="pt-20">
        <PricingSection />
        
        {/* FAQ Section */}
        <section className="py-12 px-4 md:py-24 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="grid gap-6">
              {[
                {
                  question: "Can I switch plans later?",
                  answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes will be reflected in your next billing cycle."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
                },
                {
                  question: "Is there a free trial?",
                  answer: "Yes, all paid plans come with a 14-day free trial, no credit card required."
                },
                {
                  question: "What happens when I run out of credits?",
                  answer: "On the Free plan, credits refresh daily. On paid plans, you have unlimited access to all features."
                },
                {
                  question: "Can I request a refund?",
                  answer: "Yes, we offer a 30-day money-back guarantee for all paid plans."
                }
              ].map((item, i) => (
                <div key={i} className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-gradient-to-br from-primary-100/80 to-primary-200/80 rounded-2xl p-8 md:p-12 shadow-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your learning experience?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of students and educators who are already using our platform to enhance their learning journey.
              </p>
              <Button className="px-8 gap-2">
                Get Started <MoveRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPagePricing;
