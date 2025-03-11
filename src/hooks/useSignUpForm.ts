
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

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
    
    // Validate passwords before submission
    if (!validatePassword()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            user_type: "student",
          },
          // Skip email confirmation
          emailRedirectTo: undefined
        },
      });

      if (error) throw error;
      
      // Set session immediately after signup
      if (data?.user) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session?.access_token || '',
          refresh_token: data.session?.refresh_token || '',
        });

        if (sessionError) throw sessionError;
      }

      toast({
        title: "Account created successfully!",
        description: "Welcome to EduPortal.",
      });
    } catch (error: any) {
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
    handleSignUp
  };
};
