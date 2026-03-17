
import { motion } from "framer-motion";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { Mail } from "lucide-react";

interface PricingPlansProps {
  billingInterval: 'monthly' | 'yearly';
  isRedirecting: boolean;
  isCurrentPlanPro: boolean;
  subscriptionLoading: boolean;
  handleSelectPlan: (planId: string) => void;
  calculateAnnualSavings?: (monthlyPrice: number) => number;
}

export function PricingPlans({
  billingInterval,
  isRedirecting,
  isCurrentPlanPro,
  subscriptionLoading,
  handleSelectPlan,
}: PricingPlansProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const tierFeatures = {
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

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-4xl mx-auto"
    >
      <SubscriptionCard
        title="Pro"
        price={billingInterval === 'monthly' ? "$5.99" : "$57.48"}
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
