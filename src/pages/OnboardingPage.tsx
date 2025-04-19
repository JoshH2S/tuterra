
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProfileSetup } from "@/components/onboarding/ProfileSetup";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Handle plan parameter from URL or localStorage
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      // Store plan information from URL if available
      const planType = planParam === 'pro' ? 'pro_plan' : 'free_plan';
      localStorage.setItem('selectedPlan', planType);
      
      // Show welcome toast based on plan
      toast({
        title: `Welcome to ${planType === 'pro_plan' ? 'Pro' : 'Free'} plan!`,
        description: "Let's set up your profile to get started.",
      });
    }
  }, [searchParams, toast]);

  const handleComplete = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <motion.div 
      className="min-h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ProfileSetup onComplete={handleComplete} />
    </motion.div>
  );
};

export default OnboardingPage;
