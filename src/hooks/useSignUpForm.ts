import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculatePasswordStrength, validatePasswordRequirements } from "@/lib/password";
import { usePromoCode } from "./usePromoCode";

// Note: Promo codes are automatically redeemed via database trigger 
// (handle_new_user_promo_code) when the profile is created after email verification

export const useSignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // ADD PROMO CODE FIELDS
  const [promoCode, setPromoCode] = useState("");
  const [feedbackConsent, setFeedbackConsent] = useState(false);
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [formError, setFormError] = useState("");
  const { toast } = useToast();
  
  // ADD PROMO CODE HOOK - only used for validation
  // Actual redemption happens via database trigger after email verification
  const { validateCode } = usePromoCode();

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
      const { allMet } = validatePasswordRequirements(password);
      if (allMet && passwordError === "Password doesn't meet requirements") {
        setPasswordError("");
      }
    } else {
      setPasswordStrength(0);
    }
  }, [password, passwordError]);

  const validatePassword = () => {
    if (!passwordTouched) return true;
    
    const { allMet } = validatePasswordRequirements(password);
    if (!allMet) {
      setPasswordError("Password doesn't meet requirements");
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  const checkExistingUser = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });

      if (error) {
        if (error.message.includes("Email not found")) {
          return 'not_found';
        }
        throw error;
      }

      try {
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/verify-email`
          }
        });
        
        if (resendError) throw resendError;
        
        setVerificationSent(true);
        toast({
          title: "Email verification sent",
          description: "Please check your inbox and verify your email to continue.",
        });
        return 'unconfirmed';
      } catch (resendError: any) {
        toast({
          title: "Account already exists",
          description: "Please log in instead.",
          variant: "destructive",
        });
        return 'confirmed';
      }
    } catch (error: any) {
      console.error("Error checking user:", error);
      return 'not_found';
    }
  };

  // ADD PROMO CODE VALIDATION FUNCTION
  const handlePromoCodeValidation = async () => {
    if (!promoCode.trim()) {
      setPromoCodeApplied(false);
      return true;
    }

    const validation = await validateCode(promoCode);
    if (!validation.isValid) {
      setFormError(validation.errorMessage || "Invalid promo code");
      toast({
        title: "Invalid Promo Code",
        description: validation.errorMessage || "Please check your promo code and try again",
        variant: "destructive",
      });
      return false;
    }

    // Check if FIRST30 requires feedback consent
    if (promoCode.toUpperCase() === 'FIRST30' && !feedbackConsent) {
      setFormError("You must consent to feedback collection to use this promo code");
      toast({
        title: "Feedback Consent Required",
        description: "The FIRST30 promo requires feedback consent",
        variant: "destructive",
      });
      return false;
    }

    setPromoCodeApplied(true);
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!validatePassword()) {
      return;
    }

    // ADD PROMO CODE VALIDATION
    const promoValid = await handlePromoCodeValidation();
    if (!promoValid) {
      return;
    }
    
    setLoading(true);
    
    try {
      const userStatus = await checkExistingUser();
      
      if (userStatus === 'not_found') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              user_type: "student",
              subscription_tier: "free",
              // STORE PROMO INFO IN METADATA
              promo_code: promoCode.toUpperCase() || null,
              feedback_consent: feedbackConsent,
            },
            emailRedirectTo: `${window.location.origin}/verify-email`
          },
        });

        if (error) throw error;
        
        if (data?.user) {
          // Promo code is stored in user metadata and will be automatically
          // redeemed via database trigger when profile is created after verification
          
          setVerificationSent(true);
          toast({
            title: "Verification email sent!",
            description: promoCodeApplied 
              ? "Please check your inbox. Your promo code will be applied after verification."
              : "Please check your inbox and verify your email to continue.",
          });
          
          localStorage.setItem("pendingVerificationEmail", email);
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setFormError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    // ADD PROMO CODE FIELDS
    promoCode,
    setPromoCode,
    feedbackConsent,
    setFeedbackConsent,
    promoCodeApplied,
    loading,
    passwordError,
    setPasswordError,
    passwordStrength,
    passwordTouched,
    setPasswordTouched,
    validatePassword,
    handleSignUp,
    verificationSent,
    formError
  };
};
