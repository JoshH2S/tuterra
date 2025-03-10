
import { motion } from "framer-motion";
import { useState } from "react";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { PasswordInputs } from "./PasswordInputs";
import { SubmitButton } from "./SubmitButton";
import { SignUpFormHeader } from "./SignUpFormHeader";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { Checkbox } from "@/components/ui/checkbox";
import { PrivacyPolicyLink } from "@/components/legal/PrivacyPolicyLink";
import { Label } from "@/components/ui/label";

export const SignUpForm = () => {
  const {
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
  } = useSignUpForm();
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setShowTermsError(true);
      return;
    }
    setShowTermsError(false);
    handleSignUp(e);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SignUpFormHeader />

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-4">
          <PersonalInfoInputs
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
          />

          {/* Password Section */}
          <PasswordInputs
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
            passwordStrength={passwordStrength}
            passwordTouched={passwordTouched}
            setPasswordTouched={setPasswordTouched}
            validatePassword={validatePassword}
          />
        </div>
        
        {/* Privacy Policy Checkbox */}
        <div className="flex items-start space-x-2 pt-2">
          <Checkbox 
            id="terms" 
            checked={acceptedTerms}
            onCheckedChange={(checked) => {
              setAcceptedTerms(checked as boolean);
              if (checked) setShowTermsError(false);
            }}
            className="mt-1"
          />
          <div className="space-y-1">
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the <PrivacyPolicyLink /> and <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>
            </Label>
            {showTermsError && (
              <p className="text-sm text-destructive">
                You must agree to continue
              </p>
            )}
          </div>
        </div>

        <SubmitButton loading={loading} />
        
        <p className="text-xs text-center text-muted-foreground pt-2">
          By signing up, you agree to our <PrivacyPolicyLink className="text-xs text-primary hover:underline cursor-pointer" /> and Terms of Service
        </p>
      </form>
    </motion.div>
  );
};
