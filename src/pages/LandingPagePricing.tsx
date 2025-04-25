
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumContentCard } from "@/components/ui/premium-card";
import { PricingCard } from "@/components/pricing/PricingCard";
import { Layout } from "@/components/layout/Layout";

const tierFeatures = {
  free: [
    "5 quizzes per month",
    "2 interview simulations per month",
    "1 skill assessment per month",
    "Basic dashboard and course tracking",
  ],
  pro: [
    "Unlimited quizzes, assessments, and interview simulations",
    "AI feedback on every quiz and skill report",
    "Learning path planning & skill progress tracking",
  ],
  enterprise: [
    "Designed for schools, bootcamps, and institutions",
    "Custom onboarding & dashboards",
    "Group analytics and LMS integrations",
    "Instructor tools",
    "Content alignment with school curriculum",
    "Admin panel to manage learners",
  ],
};

export default function LandingPagePricing() {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (planType: 'free' | 'pro' | 'enterprise') => {
    switch (planType) {
      case 'free':
      case 'pro':
        navigate('/auth?tab=signup');
        break;
      case 'enterprise':
        navigate('/contact');
        break;
    }
  };

  const calculateYearlyPrice = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% discount
    return yearlyPrice.toFixed(2);
  };

  return (
    <Layout isLandingPage>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Choose the perfect plan for your needs. No hidden fees.
          </p>

          <PremiumContentCard 
            title="Billing Options"
            variant="glass" 
            className="max-w-xs mx-auto p-2"
          >
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="monthly" 
                  onClick={() => setBillingInterval('monthly')}
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger 
                  value="yearly" 
                  onClick={() => setBillingInterval('yearly')}
                >
                  Yearly <span className="ml-1 text-xs text-emerald-600">-20%</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </PremiumContentCard>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto"
        >
          <PricingCard
            title="Free"
            price="$0"
            period={billingInterval}
            description="Explore core tools with limited usage"
            features={tierFeatures.free}
            onSelect={() => handleSelectPlan('free')}
            buttonText="Start Free"
            customButtonVariant="outline"
          />

          <PricingCard
            title="Pro"
            price={billingInterval === 'monthly' ? "$9.99" : `$${calculateYearlyPrice(9.99)}`}
            period={billingInterval}
            description="Everything you need for serious learning"
            features={tierFeatures.pro}
            isPopular={true}
            onSelect={() => handleSelectPlan('pro')}
            buttonText="Choose Pro"
          />

          <PricingCard
            title="Enterprise"
            price="Custom pricing"
            description="For schools, institutions, and organizations"
            features={tierFeatures.enterprise}
            onSelect={() => handleSelectPlan('enterprise')}
            buttonText="Contact Sales"
            buttonIcon={<Mail className="w-4 h-4" />}
            customButtonVariant="outline"
          />
        </motion.div>

        <PremiumContentCard
          title="Questions about our plans?"
          description="Contact our support team for more information about which plan is right for you."
          variant="minimal"
          className="mt-12 max-w-3xl mx-auto text-center"
        >
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/contact')}
            >
              Contact Support
            </Button>
          </div>
        </PremiumContentCard>
      </div>
    </Layout>
  );
}
