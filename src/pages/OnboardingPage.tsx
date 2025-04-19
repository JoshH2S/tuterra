
import { useNavigate } from "react-router-dom";
import { ProfileSetup } from "@/components/onboarding/ProfileSetup";

const OnboardingPage = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // After onboarding, go to pricing
    navigate("/pricing", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      <ProfileSetup onComplete={handleComplete} />
    </div>
  );
};

export default OnboardingPage;
