
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TermsAgreement } from "./TermsAgreement";
import { VerificationSentAlert } from "./VerificationSentAlert";

interface SignUpFormProps {
  onSignUpSuccess?: () => void;
}

export const SignUpForm = ({ onSignUpSuccess }: SignUpFormProps) => {
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
  } = useSignUpForm();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    try {
      setResendingEmail(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin + "/verify-email"
        }
      });

      if (error) throw error;

      toast({
        title: "Verification email resent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      console.error('Failed to resend verification:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple rapid submits

    await handleSignUp(e);
    if (verificationSent) {
      onSignUpSuccess?.();
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

      {verificationSent ? (
        <VerificationSentAlert 
          email={email}
          onResend={handleResendVerification}
          isResending={resendingEmail}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
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

          <TermsAgreement
            agreed={agreedToTerms}
            onAgreeChange={setAgreedToTerms}
            onShowTerms={() => setShowTerms(true)}
            onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
          />

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
