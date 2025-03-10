
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Clock, HelpCircle } from "lucide-react";

export const EmailVerification = () => {
  // This would be replaced with the actual verification link from URL params in a real implementation
  const verificationLink = "https://eduportal.com/verify?token=example";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-[180px]"
        >
          <img 
            src="/lovable-uploads/ab68bba9-f2b9-4344-9799-6209be49e097.png"
            alt="EduPortal Logo" 
            className="w-full h-auto"
          />
        </motion.div>
      </div>

      {/* Main Card */}
      <Card className="shadow-lg border-0 overflow-hidden">
        {/* Gold Header Bar */}
        <div className="h-2 bg-primary" />
        
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="text-center mb-6">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-2xl md:text-3xl font-bold text-gray-800 mb-1"
            >
              Welcome to EduPortal!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-xl text-gray-600"
            >
              Thanks for signing up!
            </motion.p>
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="space-y-6"
          >
            <p className="text-gray-700 leading-relaxed">
              We're excited to have you join our community! To get started, please confirm your email address by clicking the button below. This ensures we have the correct information and can keep your account secure.
            </p>

            {/* Confirmation Button */}
            <div className="flex justify-center py-2">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-lg font-medium shadow-md"
                  onClick={() => window.location.href = verificationLink}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Confirm Your Account
                </Button>
              </motion.div>
            </div>

            {/* Alternative Link */}
            <div className="pt-4 space-y-2">
              <p className="text-sm text-gray-600">
                If you're having trouble with the button above, please copy and paste the following link into your web browser:
              </p>
              <div className="bg-gray-50 p-3 rounded-md">
                <a 
                  href={verificationLink}
                  className="text-sm text-primary-blue font-mono break-all flex items-start"
                >
                  <ExternalLink className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                  <span>{verificationLink}</span>
                </a>
              </div>
            </div>

            {/* Expiration Notice */}
            <div className="flex items-center text-amber-600 text-sm">
              <Clock className="h-4 w-4 mr-1.5" />
              <p>Note: This link will expire after 24 hours.</p>
            </div>

            {/* Support Information */}
            <div className="flex items-start text-gray-600 bg-gray-50 p-4 rounded-md text-sm">
              <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 mt-0.5" />
              <p>
                If you did not sign up for an EduPortal account, please ignore this email or contact our support team for assistance at{" "}
                <a href="mailto:support@eduportal.com" className="text-primary hover:underline">
                  support@eduportal.com
                </a>
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="pt-8 text-center space-y-1"
          >
            <p className="text-gray-600">Thanks,</p>
            <p className="font-medium text-gray-700">The EduPortal Team</p>
          </motion.div>
        </CardContent>
      </Card>

      {/* Mobile Responsive Notes */}
      <div className="mt-6 text-center text-xs text-gray-500 px-4">
        <p>Having trouble viewing this page? Please try on a larger screen or contact support.</p>
      </div>
    </motion.div>
  );
};
