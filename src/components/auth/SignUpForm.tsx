
import { motion } from "framer-motion";
import { useState } from "react";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { PasswordInputs } from "./PasswordInputs";
import { SubmitButton } from "./SubmitButton";
import { SignUpFormHeader } from "./SignUpFormHeader";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfUse } from "@/components/legal/TermsOfUse";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";

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

  // Add state for terms acceptance and policy dialogs
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Wrap the original handleSignUp to prevent submission if terms not accepted
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

        {/* Terms and Privacy Policy Agreement */}
        <div className="flex items-start space-x-2 mt-4">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <button
                type="button"
                className="text-primary hover:underline focus:outline-none focus:underline"
                onClick={() => setShowTerms(true)}
              >
                Terms of Use
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="text-primary hover:underline focus:outline-none focus:underline"
                onClick={() => setShowPrivacyPolicy(true)}
              >
                Privacy Policy
              </button>
            </label>
            <p className="text-xs text-muted-foreground flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Your data is protected and secured
            </p>
          </div>
        </div>

        <SubmitButton loading={loading} disabled={!agreedToTerms} />
      </form>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogTitle>Privacy Policy</DialogTitle>
          <PrivacyPolicy />
        </DialogContent>
      </Dialog>

      {/* Terms of Use Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogTitle>Terms of Use</DialogTitle>
          <TermsOfUse />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
