
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculatePasswordStrength, validatePasswordRequirements } from "@/lib/password";

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
      const { data: { users }, error } = await supabase.auth.admin.listUsers({
        filter: {
          email: email
        }
      });

      if (error) throw error;

      if (users && users.length > 0) {
        const user = users[0];
        if (!user.email_confirmed_at) {
          // User exists but hasn't confirmed email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: window.location.origin + "/verify-email"
            }
          });
          
          if (resendError) throw resendError;
          
          setVerificationSent(true);
          toast({
            title: "Email verification resent",
            description: "Please check your inbox and verify your email to continue.",
          });
          return 'unconfirmed';
        } else {
          // User exists and has confirmed email
          toast({
            title: "Account already exists",
            description: "Please log in instead.",
            variant: "destructive",
          });
          return 'confirmed';
        }
      }
      return 'not_found';
    } catch (error: any) {
      console.error("Error checking user:", error);
      throw error;
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
      // Check if user exists before attempting signup
      const userStatus = await checkExistingUser();
      
      if (userStatus === 'not_found') {
        // Proceed with new signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              user_type: "student",
            },
            emailRedirectTo: window.location.origin + "/verify-email"
          },
        });

        if (error) throw error;
        
        if (data?.user) {
          setVerificationSent(true);
          toast({
            title: "Verification email sent!",
            description: "Please check your inbox and verify your email to continue.",
          });
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
