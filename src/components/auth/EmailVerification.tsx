
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { VerificationProgress } from "./verification/VerificationProgress";
import { VerificationError } from "./verification/VerificationError";
import { VerificationSuccess } from "./verification/VerificationSuccess";
import { PendingVerification } from "./verification/PendingVerification";

export const EmailVerification = () => {
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  // Add the missing handleContinue function
  const handleContinue = () => {
    navigate("/onboarding", { replace: true });
  };

  useEffect(() => {
    const processEmailVerification = async () => {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      
      if (hashParams.has("error")) {
        const errorDesc = hashParams.get("error_description");
        setError(errorDesc || "Verification failed. Please try again.");
        return;
      }
      
      if (location.hash && hashParams.has("access_token")) {
        setVerifying(true);
        
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;
          
          if (sessionData?.session) {
            setVerificationSuccess(true);
            navigate("/onboarding", { replace: true });
          }
        } catch (err: any) {
          console.error("Verification error:", err);
          setError(err.message || "Failed to verify email. Please try again.");
        } finally {
          setVerifying(false);
        }
      }
    };
    
    processEmailVerification();
  }, [location, navigate]);
  
  const handleResendVerification = async () => {
    try {
      setVerifying(true);
      const redirectTo = `${window.location.origin}/verify-email`;
      
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: localStorage.getItem("pendingVerificationEmail") || "",
        options: {
          emailRedirectTo: redirectTo,
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
          <VerificationProgress verifying={verifying} />
          
          {error ? (
            <VerificationError 
              error={error}
              onResend={handleResendVerification}
            />
          ) : verificationSuccess ? (
            <VerificationSuccess onContinue={handleContinue} />
          ) : (
            <PendingVerification
              onResend={handleResendVerification}
              verifying={verifying}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-xs text-gray-500 px-4">
        <p>Having trouble viewing this page? Please try on a larger screen or contact support.</p>
      </div>
    </motion.div>
  );
};
