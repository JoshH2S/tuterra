
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: you could verify the subscription status here
    // by calling an endpoint that checks the latest subscription status
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[70vh] w-full max-w-full">
      <div className="bg-background rounded-lg shadow-sm border p-6 sm:p-8 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-12 sm:h-16 w-12 sm:w-16 text-emerald-500" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Subscription Successful!</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          Thank you for subscribing! Your account has been upgraded and you now have access to all premium features.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/profile-settings')}
            className="w-full sm:w-auto"
          >
            Manage Subscription
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
