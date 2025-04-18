
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Clock, HelpCircle, Check, AlertCircle } from "lucide-react";
import { WelcomePopup } from "../onboarding/WelcomePopup";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useSubscriptionManagement } from "@/hooks/useSubscriptionManagement";

export const EmailVerification = () => {
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [redirectingToCheckout, setRedirectingToCheckout] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { createCheckoutSession } = useSubscriptionManagement();
  
  // Process verification and handle plan selection
  useEffect(() => {
    const processEmailVerification = async () => {
      const searchParams = new URLSearchParams(location.search);
      const selectedPlan = searchParams.get("plan") || localStorage.getItem("selectedPlan") || "free_plan";
      
      if (searchParams.has("error_description")) {
        setError(searchParams.get("error_description") || "Verification failed.");
        return;
      }
      
      if (location.hash) {
        const hashParams = new URLSearchParams(location.hash.substring(1));
        if (hashParams.has("access_token")) {
          setVerifying(true);
          
          try {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) throw sessionError;
            
            if (sessionData?.session) {
              setVerificationSuccess(true);
              
              // Handle plan-specific flow
              if (selectedPlan === "free_plan") {
                // For free plan, show welcome popup and then redirect to onboarding
                setTimeout(() => {
                  setShowWelcomePopup(true);
                }, 1500);
              } else if (selectedPlan === "pro_plan" || selectedPlan === "premium_plan") {
                // For paid plans, redirect to Stripe checkout after a short delay
                setTimeout(async () => {
                  setRedirectingToCheckout(true);
                  
                  // Redirect to Stripe checkout
                  await createCheckoutSession({
                    planId: selectedPlan as "pro_plan" | "premium_plan",
                    successUrl: `${window.location.origin}/subscription-success?onboarding=true`,
                    cancelUrl: `${window.location.origin}/subscription-canceled?plan=${selectedPlan}`
                  });
                }, 1500);
              }
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            setError(err.message || "Failed to verify email. Please try again.");
          } finally {
            setVerifying(false);
          }
        }
      }
    };
    
    processEmailVerification();
  }, [location, createCheckoutSession, navigate]);
  
  const handleResendVerification = async () => {
    try {
      setVerifying(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: localStorage.getItem("pendingVerificationEmail") || "",
        options: {
          emailRedirectTo: window.location.origin + "/verify-email",
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox for the verification link.",
      });
    } catch (err: any) {
      console.error("Failed to resend verification email:", err);
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setVerifying(false);
    }
  };
  
  const handleContinue = () => {
    // If we're on a subscription plan, this should be handled by the subscription flow
    // For free plans, go directly to onboarding or dashboard
    localStorage.removeItem("selectedPlan"); // Clear plan selection after use
    navigate("/", { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-[180px]"
        >
          <img 
            src="/lovable-uploads/ab68bba9-f2b9-4344-9799-6209be49e097.png"
            alt="EduPortal Logo" 
            className="w-full h-auto"
          />
        </motion.div>
      </div>

      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary-100 to-primary-400" />
        
        <CardContent className="p-8">
          {verifying || redirectingToCheckout ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">
                {redirectingToCheckout ? "Preparing your checkout..." : "Verifying your email..."}
              </p>
            </div>
          ) : error ? (
            <div className="space-y-6">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <p className="text-gray-700">
                We couldn't verify your email. This could be because the verification link expired or was already used.
              </p>
              
              <div className="flex justify-center py-4">
                <Button onClick={handleResendVerification}>
                  Resend Verification Email
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 text-center">
                If you continue having issues, please contact our support team.
              </p>
            </div>
          ) : verificationSuccess ? (
            <div className="space-y-6 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-800">Email Verified!</h2>
              
              <p className="text-gray-600">
                Your email has been successfully verified. 
                {localStorage.getItem("selectedPlan") === "free_plan" ? 
                  " You can now continue to set up your profile." : 
                  " You'll be redirected to complete your subscription."}
              </p>
              
              {localStorage.getItem("selectedPlan") === "free_plan" && (
                <Button
                  size="lg"
                  className="px-8"
                  onClick={handleContinue}
                >
                  Continue to EduPortal
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <motion.h1 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-2xl md:text-3xl font-bold text-gray-800 mb-1"
                >
                  Verify Your Email
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="text-xl text-gray-600"
                >
                  Almost there!
                </motion.p>
              </div>

              <Alert className="bg-blue-50 border-blue-200 rounded-md">
                <Mail className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  A verification email has been sent to your inbox. Please click the link in the email to verify your account.
                </AlertDescription>
              </Alert>

              <div className="pt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  Didn't receive an email? Check your spam folder or click below to resend the verification email:
                </p>
                <div className="flex justify-center py-2">
                  <Button 
                    variant="outline" 
                    onClick={handleResendVerification} 
                    disabled={verifying}
                    className="bg-white hover:bg-gray-50 active:scale-95 transition-transform touch-manipulation"
                  >
                    {verifying ? "Sending..." : "Resend Verification Email"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center text-amber-600 text-sm">
                <Clock className="h-4 w-4 mr-1.5" />
                <p>Note: Verification links will expire after 24 hours.</p>
              </div>

              <div className="flex items-start text-gray-600 bg-gray-50 p-4 rounded-md text-sm">
                <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 mt-0.5" />
                <p>
                  If you're having trouble verifying your email, please contact our support team for assistance at{" "}
                  <a href="mailto:support@tuterra.com" className="text-primary hover:underline">
                    support@tuterra.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-xs text-gray-500 px-4">
        <p>Having trouble viewing this page? Please try on a larger screen or contact support.</p>
      </div>

      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => {
          setShowWelcomePopup(false);
          // After closing welcome popup, redirect to onboarding
          navigate("/", { replace: true });
        }} 
      />
    </motion.div>
  );
};
