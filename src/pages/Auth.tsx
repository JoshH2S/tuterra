import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { EmailVerification } from "@/components/auth/EmailVerification";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { WelcomePopup } from "@/components/onboarding/WelcomePopup";
interface AuthProps {
  mode?: "emailVerification" | "resetPassword";
}
const Auth = ({
  mode: propMode
}: AuthProps = {}) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryMode = queryParams.get("mode") as "emailVerification" | "resetPassword" | null;
  const mode = propMode || queryMode || undefined;
  if (mode === "emailVerification") {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <EmailVerification />
      </div>;
  }
  if (mode === "resetPassword") {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>;
  }
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} transition={{
    duration: 0.5
  }} className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-0 mb-8">
        <CardHeader>
          <CardTitle className="text-center">Welcome to Tuterra</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm onSignUpSuccess={() => setShowWelcome(true)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <motion.div initial={{
      y: 20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      delay: 0.2,
      duration: 0.5
    }} className="w-[200px]">
        <img alt="EduPortal Logo" className="w-full h-auto" src="/lovable-uploads/7ab2ba58-1918-4a73-85e1-7793751f29b4.png" />
      </motion.div>

      <WelcomePopup isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
    </motion.div>;
};
export default Auth;