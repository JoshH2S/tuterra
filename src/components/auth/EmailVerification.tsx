
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { VerificationProgress } from "./verification/VerificationProgress";
import { VerificationError } from "./verification/VerificationError";
import { VerificationSuccess } from "./verification/VerificationSuccess";
import { PendingVerification } from "./verification/PendingVerification";

// Use this for consistent URLs across environments
const SITE_URL = window.location.origin;

export const EmailVerification = () => {
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleContinue = () => {
    navigate("/onboarding", { replace: true });
  };

  // Check for existing session when component mounts
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setVerificationSuccess(true);
        // Add short delay then redirect
        setTimeout(() => {
          navigate("/onboarding", { replace: true });
        }, 1500);
      }
    };
    
    checkExistingSession();
  }, [navigate]);

  useEffect(() => {
    const processEmailVerification = async () => {
      // Handle errors in the URL parameters (query parameters)
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.has("error")) {
        const errorCode = searchParams.get("error_code");
        const errorDescription = searchParams.get("error_description");
        
        if (errorCode === "otp_expired") {
          setError("Your verification link has expired. Please request a new one.");
        } else {
          setError(errorDescription || "Verification failed. Please try again.");
        }
        return;
      }
      
      // Handle hash fragments for Supabase auth
      const hashParams = new URLSearchParams(location.hash.substring(1));
      
      if (hashParams.has("error")) {
        const errorDesc = hashParams.get("error_description");
        setError(decodeURIComponent(errorDesc || "Verification failed"));
        return;
      }
      
      if (hashParams.has("access_token")) {
        setVerifying(true);
        
        try {
          // Use exchangeCodeForSession instead of getSession to properly process the token in the URL
          const { error } = await supabase.auth.exchangeCodeForSession();
          if (error) throw error;
          
          setVerificationSuccess(true);
          // Add delay to show success state before redirect
          setTimeout(() => {
            navigate("/onboarding", { replace: true });
          }, 1500);
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
      setError(""); // Clear previous errors
      
      const email = localStorage.getItem("pendingVerificationEmail");
      if (!email) {
        throw new Error("No email found for verification. Please try signing up again.");
      }
      
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${SITE_URL}/verify-email`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox for the verification link.",
      });
    } catch (err: any) {
      console.error("Failed to resend verification email:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to resend verification email.",
        variant: "destructive",
      });
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
            alt="Tuterra Logo" 
            className="w-full h-auto"
          />
        </motion.div>
      </div>

      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary-100 to-primary-400" />
        
        <CardContent className="p-8">
          {verifying ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              <p className="text-sm text-gray-600">Verifying your email...</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-xs text-gray-500 px-4">
        <p>Having trouble viewing this page? Please try on a larger screen or contact support.</p>
      </div>
    </motion.div>
  );
};
