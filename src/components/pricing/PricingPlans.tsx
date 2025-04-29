
import { motion } from "framer-motion";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { SubscriptionFeatures } from "./SubscriptionFeatures";
import { Mail } from "lucide-react";

interface PricingPlansProps {
  billingInterval: 'monthly' | 'yearly';
  isRedirecting: boolean;
  isCurrentPlanPro: boolean;
  subscriptionLoading: boolean;
  handleSelectPlan: (planId: string) => void;
  handlePlanDowngrade: () => void;
  calculateAnnualSavings?: (monthlyPrice: number) => number;
}

export function PricingPlans({
  billingInterval,
  isRedirecting,
  isCurrentPlanPro,
  subscriptionLoading,
  handleSelectPlan,
  handlePlanDowngrade
}: PricingPlansProps) {
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

  const proTooltips = {
    "AI feedback on every quiz and skill report": "Powered by advanced language models",
    "Learning path planning & skill progress tracking": "Personalized learning recommendations",
  };

  const enterpriseTooltips = {
    "Group analytics and LMS integrations": "Advanced reporting and insights",
    "Admin panel to manage learners": "Comprehensive user management tools",
  };

  return (
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
        buttonDisabled={false}
      />

      <SubscriptionCard
        title="Pro"
        price={billingInterval === 'monthly' ? "$9.99" : "$95.88"}
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
  );
}
