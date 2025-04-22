
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
  const [verifying, setVerifying] = useState(true); // Start with verifying=true to show loading state immediately
  const [error, setError] = useState("");
  const [processed, setProcessed] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleContinue = () => {
    navigate("/onboarding", { replace: true });
  };

  // Process tokens immediately on component mount
  useEffect(() => {
    const processAuthTokens = async () => {
      try {
        // Check for hash fragments for Supabase auth
        const hasHashParams = window.location.hash && window.location.hash.length > 1;
        
        if (hasHashParams) {
          console.log("Found hash params, processing token exchange");
          // Process the token exchange immediately
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (error) {
            console.error("Token exchange error:", error);
            setError(error.message || "Verification failed. Please try again.");
            setVerifying(false);
            setProcessed(true);
            return;
          }
          
          // Successfully exchanged token, check session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log("Session verified successfully");
            setVerificationSuccess(true);
            // Add delay to show success state before redirect
            setTimeout(() => {
              navigate("/onboarding", { replace: true });
            }, 1500);
          } else {
            throw new Error("Session could not be established after verification");
          }
        } 
        else {
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
          } 
          else {
            // Check for existing session when no hash params
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              setVerificationSuccess(true);
              // Add short delay then redirect
              setTimeout(() => {
                navigate("/onboarding", { replace: true });
              }, 1500);
            }
          }
        }
      } catch (err: any) {
        console.error("Verification process error:", err);
        setError(err.message || "Failed to verify email. Please try again.");
      } finally {
        setVerifying(false);
        setProcessed(true);
      }
    };
    
    processAuthTokens();
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

  // Only render UI after initial token processing is complete
  if (!processed && verifying) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

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
            <VerificationProgress verifying={verifying} />
          ) : (
            <>
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
