
import { Mail, Clock, HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PendingVerificationProps {
  onResend: () => void;
  verifying: boolean;
}

export const PendingVerification = ({ onResend, verifying }: PendingVerificationProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-1"
        >
          Verify Your Email
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-xl text-gray-600"
        >
          Almost there!
        </motion.p>
      </div>

      <Alert className="bg-blue-50 border-blue-200 rounded-md">
        <Mail className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-800">
          A verification email has been sent to your inbox. Please click the link in the email to verify your account.
        </AlertDescription>
      </Alert>

      <div className="pt-4 space-y-2">
        <p className="text-sm text-gray-600">
          Didn't receive an email? Check your spam folder or click below to resend the verification email:
        </p>
        <div className="flex justify-center py-2">
          <Button 
            variant="outline" 
            onClick={onResend} 
            disabled={verifying}
            className="bg-white hover:bg-gray-50 active:scale-95 transition-transform touch-manipulation"
          >
            {verifying ? "Sending..." : "Resend Verification Email"}
          </Button>
        </div>
      </div>

      <div className="flex items-center text-amber-600 text-sm">
        <Clock className="h-4 w-4 mr-1.5" />
        <p>Note: Verification links will expire after 24 hours.</p>
      </div>

      <div className="flex items-start text-gray-600 bg-gray-50 p-4 rounded-md text-sm">
        <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 mt-0.5" />
        <p>
          If you're having trouble verifying your email, please contact our support team for assistance at{" "}
          <a href="mailto:support@tuterra.com" className="text-primary hover:underline">
            support@tuterra.com
          </a>
        </p>
      </div>
    </div>
  );
};
