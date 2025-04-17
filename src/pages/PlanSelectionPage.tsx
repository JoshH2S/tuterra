
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PremiumContentCard } from "@/components/ui/premium-card";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Header1 } from "@/components/ui/header";

export default function PlanSelectionPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // Features for each tier
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
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    
    // Store the selection in sessionStorage
    sessionStorage.setItem("selectedPlan", planId);
    
    // Redirect to auth page with signup tab selected
    navigate("/auth?tab=signup&plan=" + planId);
  };
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-white w-full">
      <Header1 />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Select the plan that best fits your learning journey
          </p>
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
            onSelect={() => handleSelectPlan("free_plan")}
            buttonText="Select Free Plan"
            buttonDisabled={false}
            isSelected={selectedPlan === "free_plan"}
          />

          {/* Pro Plan */}
          <SubscriptionCard
            title="Pro"
            price="$9.99"
            description="Everything you need for serious learning"
            features={tierFeatures.pro}
            planId="pro_plan"
            isPopular={true}
            onSelect={() => handleSelectPlan("pro_plan")}
            buttonText="Select Pro Plan"
            buttonDisabled={false}
            isSelected={selectedPlan === "pro_plan"}
          />

          {/* Enterprise Plan */}
          <SubscriptionCard
            title="Enterprise"
            price="Custom pricing"
            description="For schools, institutions, and organizations"
            features={tierFeatures.enterprise}
            planId="enterprise_plan"
            onSelect={() => handleSelectPlan("enterprise_plan")}
            buttonText="Contact Sales"
            customButtonVariant="outline"
            isSelected={selectedPlan === "enterprise_plan"}
          />
        </motion.div>

        <PremiumContentCard
          title="Questions about our plans?"
          description="Contact our support team for more information about which plan is right for you."
          variant="minimal"
          className="mt-12 max-w-3xl mx-auto text-center"
        >
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/contact")}>
              Contact Support
            </Button>
          </div>
        </PremiumContentCard>
      </div>
    </div>
  );
}
