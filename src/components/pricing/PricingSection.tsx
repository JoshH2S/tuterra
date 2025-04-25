
import { motion } from "framer-motion";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Mail } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumContentCard } from "@/components/ui/premium-card";

export function PricingSection() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

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
      "Custom onboarding & dashboards",
      "Group analytics and LMS integrations",
      "Instructor tools and admin panel",
      "Content alignment with school curriculum",
      "Advanced reporting and insights",
    ],
  };

  const handlePlanSelect = (planId: string) => {
    if (planId === 'enterprise_plan') {
      window.location.href = '/contact';
      return;
    }
    window.location.href = `/auth?tab=signup&plan=${planId}`;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
        }}
        className="max-w-3xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Learning Journey</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Select the plan that best fits your educational needs
        </p>
        
        <PremiumContentCard 
          title="Billing Options"
          variant="glass" 
          className="max-w-xs mx-auto p-2"
        >
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly" onClick={() => setBillingInterval('monthly')}>
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" onClick={() => setBillingInterval('yearly')}>
                Yearly <span className="ml-1 text-xs text-emerald-600">-20%</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </PremiumContentCard>
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
        }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto"
      >
        <SubscriptionCard
          title="Free"
          price="$0"
          description="Explore core tools with limited usage"
          features={tierFeatures.free}
          planId="free_plan"
          onSelect={handlePlanSelect}
          buttonText="Start Free"
        />

        <SubscriptionCard
          title="Pro"
          price={billingInterval === 'monthly' ? "$9.99" : "$95.88"}
          description="Everything you need for serious learning"
          features={tierFeatures.pro}
          planId="pro_plan"
          isPopular={true}
          onSelect={handlePlanSelect}
          buttonText="Choose Pro"
        />

        <SubscriptionCard
          title="Enterprise"
          price="Custom pricing"
          description="For schools, institutions, and organizations"
          features={tierFeatures.enterprise}
          planId="enterprise_plan"
          onSelect={handlePlanSelect}
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
          <Button variant="outline" onClick={() => window.location.href = '/contact'}>
            Contact Support
          </Button>
        </div>
      </PremiumContentCard>
    </div>
  );
}
