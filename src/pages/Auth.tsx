
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { EmailVerification } from "@/components/auth/EmailVerification";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

interface AuthProps {
  mode?: "emailVerification" | "resetPassword";
}

const Auth = ({ mode: propMode }: AuthProps = {}) => {
  // Check for mode in URL query params as well
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryMode = queryParams.get("mode") as "emailVerification" | "resetPassword" | null;
  
  // Use prop mode if provided, otherwise check query param
  const mode = propMode || queryMode || undefined;

  if (mode === "emailVerification") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <EmailVerification />
      </div>
    );
  }

  if (mode === "resetPassword") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-[50px] w-[200px]"
      >
        <img 
          src="/lovable-uploads/ab68bba9-f2b9-4344-9799-6209be49e097.png" 
          alt="EduPortal Logo"
          className="w-full h-auto"
        />
      </motion.div>
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-center">Welcome to EduPortal</CardTitle>
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
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Auth;
