
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculatePasswordStrength, validatePasswordRequirements } from "@/lib/password";

// Use this for consistent URLs across environments
const SITE_URL = window.location.origin;

export const useSignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [formError, setFormError] = useState("");
  const { toast } = useToast();

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
            emailRedirectTo: `${SITE_URL}/verify-email`
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!validatePassword()) {
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
            },
            emailRedirectTo: `${SITE_URL}/verify-email`
          },
        });

        if (error) throw error;
        
        if (data?.user) {
          setVerificationSent(true);
          toast({
            title: "Verification email sent!",
            description: "Please check your inbox and verify your email to continue.",
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
