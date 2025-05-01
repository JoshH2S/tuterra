
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { motion } from "framer-motion";

const ForgotPasswordPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-[180px]"
        >
          <img 
            src="/lovable-uploads/ab68bba9-f2b9-4344-9799-6209be49e097.png"
            alt="Tuterra Logo" 
            className="w-full h-auto"
          />
        </motion.div>
      </div>

      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-center">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ForgotPassword />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ForgotPasswordPage;
