
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumContentCard } from "@/components/ui/premium-card";
import { Mail, Info, Check } from "lucide-react";
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";
import { useToast } from "@/hooks/use-toast";

export default function PricingPage() {
  const { isLoggedIn } = useAuthStatus();
  const navigate = useNavigate();
  const { createCheckoutSession, subscription, subscriptionLoading } = useSubscriptionManagement();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();
  
  const handleSelectPlan = async (planId: string) => {
    // For free plan, redirect to auth page directly
    if (planId === 'free_plan') {
      navigate('/auth?tab=signup&plan=free');
      return;
    }
    
    // For enterprise plan, redirect to contact page
    if (planId === 'enterprise_plan') {
      navigate('/contact');
      return;
    }
    
    // For pro plan, check if the user is logged in first
    if (!isLoggedIn) {
      // Save the selected plan to URL params and redirect to auth
      navigate(`/auth?tab=signup&plan=${planId}`);
      return;
    }
    
    // If user is already logged in and selected pro plan, proceed to checkout
    setIsRedirecting(true);
    
    try {
      console.log('Starting checkout for plan:', planId);
      
      const success = await createCheckoutSession({
        planId: planId,
        successUrl: `${window.location.origin}/subscription-success`,
        cancelUrl: `${window.location.origin}/subscription-canceled`,
      });

      if (!success) {
        console.error('Checkout session creation failed');
        throw new Error('Failed to create checkout session');
      }
      
      // Note: redirection happens in createCheckoutSession
    } catch (error: any) {
      console.error('Checkout error:', error);
      setIsRedirecting(false);
      
      toast({
        title: "Checkout Error",
        description: "There was a problem starting the checkout process. Please try again or contact support.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Handle browser back button during redirect
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRedirecting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRedirecting]);

  // Calculate annual savings
  const calculateAnnualSavings = useCallback((monthlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    const yearlyPrice = monthlyTotal * 0.8; // 20% discount
    const savings = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
    return Math.round(savings);
  }, []);

  // Feature with tooltip component
  const PlanFeature = ({ feature, tooltip }: { feature: string; tooltip?: string }) => (
    <li className="flex text-sm">
      <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
      <span className="ml-3 flex items-center gap-2">
        {feature}
        {tooltip && (
          <InteractiveTooltip
            trigger={<Info className="h-4 w-4 text-muted-foreground cursor-help" />}
            content={tooltip}
          />
        )}
      </span>
    </li>
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Converting the JSX elements to strings for the features prop
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

  // Function to render features with tooltips
  const renderFeatures = (features: string[], tooltips?: Record<string, string>) => {
    return features.map((feature) => (
      <PlanFeature 
        key={feature} 
        feature={feature}
        tooltip={tooltips?.[feature]}
      />
    ));
  };

  const proTooltips = {
    "AI feedback on every quiz and skill report": "Powered by advanced language models",
    "Learning path planning & skill progress tracking": "Personalized learning recommendations",
  };

  const enterpriseTooltips = {
    "Group analytics and LMS integrations": "Advanced reporting and insights",
    "Admin panel to manage learners": "Comprehensive user management tools",
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
        )}
      </motion.div>

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
          onSelect={handleSelectPlan}
          buttonText="Start Free"
          buttonDisabled={isCurrentPlan('free_plan')}
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
              : subscriptionLoading
                ? "Loading..."
                : isRedirecting 
                  ? "Redirecting..." 
                  : "Choose Pro"
          }
          buttonDisabled={isCurrentPlan('pro_plan') || isRedirecting || subscriptionLoading}
        />

        {/* Enterprise Plan */}
        <SubscriptionCard
          title="Enterprise"
          price="Custom pricing"
          description="For schools, institutions, and organizations"
          features={tierFeatures.enterprise}
          planId="enterprise_plan"
          onSelect={handleSelectPlan}
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
