
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function SubscriptionCanceled() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user came from signup flow
  const searchParams = new URLSearchParams(location.search);
  const selectedPlan = searchParams.get('plan');
  const isFromSignup = !!selectedPlan;
  
  // If user came from signup and canceled, default to free plan
  const handleFreePlan = () => {
    if (isFromSignup) {
      // Set plan to free
      localStorage.setItem('selectedPlan', 'free_plan');
      // Redirect to dashboard with free plan
      navigate('/dashboard', { replace: true });
    } else {
      // Just go back to pricing
      navigate('/pricing');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[70vh] w-full max-w-full">
      <div className="bg-background rounded-lg shadow-sm border p-6 sm:p-8 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-12 sm:h-16 w-12 sm:w-16 text-amber-500" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Subscription Canceled</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          {isFromSignup 
            ? "Your subscription process was canceled. You can continue with the free plan or try again with a paid plan."
            : "Your subscription process was canceled. You can try again or contact support if you need assistance."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isFromSignup ? (
            <>
              <Button 
                onClick={handleFreePlan}
                className="w-full sm:w-auto"
              >
                Continue with Free Plan
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/pricing')}
                className="w-full sm:w-auto"
              >
                Return to Pricing
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => navigate('/pricing')}
                className="w-full sm:w-auto"
              >
                Return to Pricing
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
