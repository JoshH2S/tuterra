
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileSetup } from "@/components/onboarding/ProfileSetup";
import { toast } from "@/hooks/use-toast";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Clear any existing onboarding progress when first loading the page
  useEffect(() => {
    // Only clear if we're on step 0 (first load)
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (!savedProgress) {
      localStorage.removeItem('onboarding_progress');
    }
  }, []);
  
  const handleComplete = () => {
    try {
      setIsRedirecting(true);
      // Show a toast to inform the user about the redirect
      toast({
        title: "Setup complete!",
        description: "Redirecting you to the pricing page...",
      });
      
      console.log("Onboarding complete, redirecting to pricing page");
      // Add a small delay to ensure the toast is visible
      setTimeout(() => {
        navigate("/pricing", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Navigation error:", error);
      toast({
        title: "Error during navigation",
        description: "Please try to navigate manually to the pricing page.",
        variant: "destructive",
      });
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ProfileSetup onComplete={handleComplete} />
    </div>
  );
};

export default OnboardingPage;
