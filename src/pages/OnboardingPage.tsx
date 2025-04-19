
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ProfileSetup } from "@/components/onboarding/ProfileSetup";
import { useToast } from "@/hooks/use-toast";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Handle plan parameter from URL or localStorage
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
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
  }, [location, toast]);

  const handleComplete = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      <ProfileSetup onComplete={handleComplete} />
    </div>
  );
};

export default OnboardingPage;
