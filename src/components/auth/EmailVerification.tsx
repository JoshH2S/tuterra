
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export const EmailVerification = () => {
  const [email, setEmail] = useState<string>("");
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { createCheckoutSession } = useSubscriptionManagement();

  // Get current location query params
  const queryParams = new URLSearchParams(location.search);
  const shouldCheckout = queryParams.get("checkout") === "true";
  const isEnterprise = queryParams.get("enterprise") === "true";
  
  useEffect(() => {
    // Try to get the email from localStorage if not already in state
    if (!email) {
      const storedEmail = localStorage.getItem("pendingVerificationEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
    
    // Check if user is already signed in
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setVerified(true);
          setVerifying(false);
          
          // Handle redirection based on plan
          setTimeout(() => handleRedirectAfterVerification(), 2000);
        } else {
          setVerifying(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setVerifying(false);
        setError("Failed to check verification status. Please try again.");
      }
    };
    
    checkSession();
  }, []);
  
  const handleRedirectAfterVerification = async () => {
    try {
      setRedirecting(true);
      
      // Check if there's a selected plan
      const selectedPlan = localStorage.getItem("selectedPlan");
      
      if (shouldCheckout && selectedPlan === "pro_plan") {
        // For Pro plan, redirect to Stripe checkout
        await createCheckoutSession({
          planId: "pro_plan",
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/subscription-canceled`,
        });
      } else if (isEnterprise && selectedPlan === "enterprise_plan") {
        // For Enterprise plan, redirect to contact page
        navigate("/contact");
      } else {
        // For Free plan or if no plan selected, redirect to onboarding
        navigate("/profile-settings");
      }
    } catch (error) {
      console.error("Error redirecting after verification:", error);
      // Fallback to dashboard if checkout fails
      navigate("/dashboard");
    }
  };
  
  const resendVerificationEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to resend the verification link.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setResendLoading(true);
      
      // Determine redirect URL based on the stored plan
      const selectedPlan = localStorage.getItem("selectedPlan");
      let redirectUrl = window.location.origin + "/verify-email";
      
      if (selectedPlan === "pro_plan") {
        redirectUrl += "?checkout=true";
      } else if (selectedPlan === "enterprise_plan") {
        redirectUrl += "?enterprise=true";
      }
      
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="inline-flex justify-center items-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          {verifying ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : verified ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : (
            <Mail className="h-8 w-8 text-primary" />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">Email Verification</h2>
        {verifying ? (
          <p className="text-muted-foreground">Checking verification status...</p>
        ) : verified ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
          >
            <p className="text-green-600 mb-2">Your email has been successfully verified!</p>
            <p className="text-muted-foreground">
              {redirecting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {shouldCheckout ? "Redirecting to checkout..." : "Redirecting to your dashboard..."}
                </span>
              ) : (
                shouldCheckout 
                  ? "You'll be redirected to complete your subscription..."
                  : "You'll be redirected to your dashboard shortly..."
              )}
            </p>
          </motion.div>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Didn't receive the email? Check your spam folder or resend it.</p>
                <Button 
                  onClick={resendVerificationEmail} 
                  variant="outline" 
                  className="w-full"
                  disabled={resendLoading}
                >
                  {resendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend Verification Email
                </Button>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/auth")}
                  className="text-sm"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </>
        )}
        
        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}
      </div>
    </div>
  );
};
