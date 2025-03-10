
import { useState } from "react";
import { motion } from "framer-motion";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { PasswordInputs } from "./PasswordInputs";
import { SubmitButton } from "./SubmitButton";
import { SignUpFormHeader } from "./SignUpFormHeader";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { LegalAgreementCheckbox } from "@/components/legal/LegalAgreementCheckbox";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agreedToTerms) {
      handleSignUp(e);
    }
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

        <LegalAgreementCheckbox 
          checked={agreedToTerms} 
          onCheckedChange={setAgreedToTerms} 
        />

        <SubmitButton loading={loading} disabled={!agreedToTerms} />
      </form>
    </motion.div>
  );
};
