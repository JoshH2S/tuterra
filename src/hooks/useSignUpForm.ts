
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculatePasswordStrength, validatePasswordRequirements } from "@/lib/password";
import { useNavigate } from "react-router-dom";

export const useSignUpForm = (selectedPlan?: string | null) => {
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
  const navigate = useNavigate();

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
      
      // Clear password error if all requirements are met
      const { allMet } = validatePasswordRequirements(password);
      if (allMet && passwordError === "Password doesn't meet requirements") {
        setPasswordError("");
      }
    } else {
      setPasswordStrength(0);
    }
  }, [password, passwordError]);

  const validatePassword = () => {
    // Only validate if password field has been touched
    if (!passwordTouched) return true;
    
    // Check password requirements
    const { allMet } = validatePasswordRequirements(password);
    if (!allMet) {
      setPasswordError("Password doesn't meet requirements");
      return false;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    // Validate passwords before submission
    if (!validatePassword()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Build the user metadata including the selected plan
      const userMetadata = {
        first_name: firstName,
        last_name: lastName,
        user_type: "student",
      };
      
      if (selectedPlan) {
        Object.assign(userMetadata, { selected_plan: selectedPlan });
      }
      
      // Determine redirect URL based on the plan
      let redirectUrl = window.location.origin + "/verify-email";
      
      // For pro plan, include query parameter to route to payment after verification
      if (selectedPlan === "pro_plan") {
        redirectUrl += "?checkout=true";
      } else if (selectedPlan === "enterprise_plan") {
        redirectUrl += "?enterprise=true";
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
          // Enable email confirmation with custom redirect
          emailRedirectTo: redirectUrl
        },
      });

      if (error) throw error;
      
      if (data?.user) {
        setVerificationSent(true);
        
        // Save selected plan to localStorage for persistence
        if (selectedPlan) {
          localStorage.setItem("selectedPlan", selectedPlan);
        }
        
        toast({
          title: "Verification email sent!",
          description: "Please check your inbox and verify your email.",
        });
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
