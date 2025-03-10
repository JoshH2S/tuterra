
import { motion } from "framer-motion";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { PasswordInputs } from "./PasswordInputs";
import { SubmitButton } from "./SubmitButton";
import { SignUpFormHeader } from "./SignUpFormHeader";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { PrivacyPolicyLink } from "@/components/legal/PrivacyPolicyLink";
import { TermsOfServiceLink } from "@/components/legal/TermsOfServiceLink";

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

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      setShowTermsError(true);
      return;
    }
    
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

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Terms agreement checkbox */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => {
                setAgreedToTerms(checked === true);
                if (checked) setShowTermsError(false);
              }}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm">
              I agree to the <PrivacyPolicyLink className="text-xs" /> and <TermsOfServiceLink className="text-xs" />
            </label>
          </div>
          {showTermsError && (
            <p className="text-destructive text-xs">
              You must agree to the terms to continue
            </p>
          )}
        </div>

        <SubmitButton loading={loading} />
      </form>
    </motion.div>
  );
};
