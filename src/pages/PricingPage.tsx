
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumContentCard } from "@/components/ui/premium-card";
import { Mail, Info, Check, AlertCircle, ArrowLeft } from "lucide-react";
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PricingPage() {
  const { isLoggedIn } = useAuthStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const { createCheckoutSession, subscription, subscriptionLoading, cancelSubscription } = useSubscriptionManagement();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isPostOnboarding, setIsPostOnboarding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Check if user just completed onboarding
    if (params.get('onboarding') === 'complete') {
      setIsPostOnboarding(true);
      toast({
        title: "Welcome to Tuterra!",
        description: "Choose a plan to get started with your learning journey.",
        duration: 6000,
      });
      // Clean up the URL
      navigate('/pricing', { replace: true });
    }
    
    if (params.get('canceled') === 'true') {
      toast({
        title: "Checkout Canceled",
        description: "Your checkout process was canceled. You can try again when you're ready.",
        duration: 5000,
      });
      navigate('/pricing', { replace: true });
    }
  }, [location.search, toast, navigate]);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free_plan') {
      if (isLoggedIn && isPostOnboarding) {
        // User just completed onboarding and chose free plan - go to dashboard
        toast({
          title: "Welcome to Tuterra!",
          description: "You're all set with the free plan. Let's get started!",
        });
        navigate('/dashboard');
        return;
      }
      navigate('/auth?tab=signup&plan=free');
      return;
    }
    if (planId === 'enterprise_plan') {
      navigate('/contact');
      return;
    }
    if (isLoggedIn) {
      if (isPostOnboarding) {
        // User just completed onboarding and wants to upgrade - proceed to checkout
        // The success URL will take them to dashboard after payment
        navigate('/profile-settings');
        return;
      }
      navigate('/profile-settings');
      return;
    }
    navigate(`/auth?tab=signup&plan=${planId}`);
  };

  const handlePlanDowngrade = async () => {
    if (!confirm("Are you sure you want to downgrade to the free plan? You'll lose access to premium features at the end of your billing period.")) {
      return;
    }
    setIsRedirecting(true);
    const success = await cancelSubscription();
    setIsRedirecting(false);

    if (success) {
      toast({
        title: "Plan Downgraded",
        description: "Your subscription will be downgraded to the free plan at the end of your billing period.",
        duration: 5000,
      });
      navigate('/profile-settings');
    }
  };

  const isCurrentPlanPro = subscription?.planId === 'pro_plan' && subscription.status === 'active';

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

  const calculateAnnualSavings = useCallback((monthlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    const yearlyPrice = monthlyTotal * 0.8; // 20% discount
    const savings = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
    return Math.round(savings);
  }, []);

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

  // Fixed pricing strings instead of React elements
  const proMainPrice = billingInterval === 'monthly' ? "$9.99" : "$7.99";
  const proSubLabel = billingInterval === 'yearly' ? "(billed annually)" : "";

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl relative">
      {!isPostOnboarding && (
        <Button 
          variant="ghost" 
          onClick={() => navigate('/profile-settings')}
          className="absolute left-4 top-4 md:left-8 md:top-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {isPostOnboarding ? "Choose Your Plan" : "Choose the Right Plan"}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {isPostOnboarding 
            ? "Select a plan to unlock your full learning potential" 
            : "Find the perfect plan for your learning journey"
          }
        </p>
        
        <PremiumContentCard 
          title="Billing Options"
          variant="glass" 
          className="max-w-xs mx-auto p-2"
        >
          <Tabs defaultValue={billingInterval} className="w-full">
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

      {location.search.includes('canceled=true') && (
        <Alert variant="warning" className="max-w-md mx-auto mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Checkout Canceled</AlertTitle>
          <AlertDescription>
            Your subscription process was canceled. You can try again when you're ready.
          </AlertDescription>
        </Alert>
      )}

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto"
      >
        <SubscriptionCard
          title="Free"
          price="$0"
          description="Explore core tools with limited usage"
          features={tierFeatures.free}
          planId="free_plan"
          onSelect={handleSelectPlan}
          buttonText="Start Free"
          buttonDisabled={subscription?.planId === 'free_plan'}
        />

        <SubscriptionCard
          title="Pro"
          price={proMainPrice}
          description="Everything you need for serious learning"
          features={tierFeatures.pro}
          planId="pro_plan"
          isPopular={true}
          onSelect={handleSelectPlan}
          buttonText={
            subscriptionLoading
              ? "Loading..."
              : isRedirecting 
                ? "Redirecting..." 
                : "Choose Pro"
          }
          buttonDisabled={isRedirecting || subscriptionLoading}
          showDowngradeButton={isCurrentPlanPro}
          onDowngrade={handlePlanDowngrade}
        />

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
          <span className="text-base text-muted-foreground">
            Email us at{" "}
            <a href="mailto:support@tuterra.ai" className="text-primary underline">
              support@tuterra.ai
            </a>
          </span>
        </div>
      </PremiumContentCard>
    </div>
  );
}
