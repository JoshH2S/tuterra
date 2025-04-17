
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { PasswordInputs } from "./PasswordInputs";
import { SubmitButton } from "./SubmitButton";
import { SignUpFormHeader } from "./SignUpFormHeader";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfUse } from "@/components/legal/TermsOfUse";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Mail, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SignUpFormProps {
  onSignUpSuccess?: () => void;
  selectedPlan?: string | null;
}

export const SignUpForm = ({ onSignUpSuccess, selectedPlan }: SignUpFormProps) => {
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
    handleSignUp,
    verificationSent,
    formError
  } = useSignUpForm(selectedPlan);

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    await handleSignUp(e);
    if (verificationSent) {
      onSignUpSuccess?.();
    }
  };

  // Get plan display info
  const getPlanInfo = () => {
    if (!selectedPlan) return null;
    
    switch(selectedPlan) {
      case 'free_plan':
        return { name: "Free Plan", color: "bg-gray-100 text-gray-700" };
      case 'pro_plan':
        return { name: "Pro Plan", color: "bg-blue-100 text-blue-700" };
      case 'enterprise_plan':
        return { name: "Enterprise Plan", color: "bg-purple-100 text-purple-700" };
      default:
        return null;
    }
  };
  
  const planInfo = getPlanInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <SignUpFormHeader />

      {verificationSent ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Alert className="bg-blue-50 border-blue-200">
            <Mail className="h-5 w-5 text-blue-500" />
            <AlertDescription className="text-blue-800">
              <span className="font-medium block">Verification email sent!</span>
              Please check your inbox at <span className="font-bold">{email}</span> and click the verification link to activate your account.
              {selectedPlan && selectedPlan !== "free_plan" && (
                <p className="mt-2">After verification, you'll be directed to complete your subscription.</p>
              )}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            Once verified, you can log in to continue with the onboarding process.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          {planInfo && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Selected Plan:</span>
              </div>
              <Badge className={`${planInfo.color} font-normal text-sm px-3 py-1`}>
                {planInfo.name}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedPlan === "pro_plan" 
                  ? "You'll proceed to payment after verification." 
                  : selectedPlan === "enterprise_plan" 
                    ? "Our team will contact you after signup." 
                    : ""}
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <PersonalInfoInputs
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
            />

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
      )}

      <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogTitle>Privacy Policy</DialogTitle>
          <PrivacyPolicy />
        </DialogContent>
      </Dialog>

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogTitle>Terms of Use</DialogTitle>
          <TermsOfUse />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
