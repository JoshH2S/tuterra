
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumContentCard } from "@/components/ui/premium-card";
import { Mail } from "lucide-react";

export default function PricingPage() {
  const { isLoggedIn } = useAuthStatus();
  const navigate = useNavigate();
  const { createCheckoutSession, subscription, subscriptionLoading } = useSubscriptionManagement();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const handleSelectPlan = async (planId: 'pro_plan') => {
    if (!isLoggedIn) {
      navigate('/auth?returnTo=/pricing');
      return;
    }
    
    setIsRedirecting(true);
    
    await createCheckoutSession({
      planId,
      successUrl: `${window.location.origin}/subscription-success`,
      cancelUrl: `${window.location.origin}/subscription-canceled`,
    });
  };
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const tierFeatures = {
    free: [
      "5 AI tutor messages per month",
      "2 quizzes per month",
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

  const isCurrentPlan = (planId: string) => {
    if (subscriptionLoading) return false;
    return subscription?.planId === planId && subscription.status === 'active';
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4">Choose the Right Plan</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Find the perfect plan for your learning journey
        </p>
        
        {billingInterval === 'monthly' && (
          <PremiumContentCard variant="glass" className="max-w-xs mx-auto p-2">
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
        )}
      </motion.div>

      {!isLoggedIn && (
        <PremiumContentCard
          title="Sign in required"
          variant="glass"
          className="max-w-3xl mx-auto mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              You need to sign in or create an account to subscribe to a plan.
            </div>
            <Button 
              onClick={() => navigate('/auth?returnTo=/pricing')}
              className="whitespace-nowrap"
            >
              Sign in
            </Button>
          </div>
        </PremiumContentCard>
      )}

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto"
      >
        {/* Free Plan */}
        <SubscriptionCard
          title="Free"
          price="$0"
          description="Explore core tools with limited usage"
          features={tierFeatures.free}
          planId="free_plan"
          onSelect={() => {}}
          buttonText="Current Plan"
          buttonDisabled={true}
        />

        {/* Pro Plan */}
        <SubscriptionCard
          title="Pro"
          price={billingInterval === 'monthly' ? "$9.99" : "$95.88"}
          description="Everything you need for serious learning"
          features={tierFeatures.pro}
          planId="pro_plan"
          isPopular={true}
          onSelect={handleSelectPlan}
          buttonText={
            isCurrentPlan('pro_plan') 
              ? "Current Plan" 
              : isRedirecting 
                ? "Redirecting..." 
                : "Upgrade to Pro"
          }
          buttonDisabled={isCurrentPlan('pro_plan') || isRedirecting}
        />

        {/* Enterprise Plan */}
        <SubscriptionCard
          title="Enterprise"
          price="Custom pricing"
          description="For schools, institutions, and organizations"
          features={tierFeatures.enterprise}
          planId="enterprise_plan"
          onSelect={() => navigate('/contact')}
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
          <Button variant="outline" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </div>
      </PremiumContentCard>
    </div>
  );
}
