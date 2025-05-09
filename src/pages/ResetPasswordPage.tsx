
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const processAuth = async () => {
      console.log("ResetPasswordPage: Processing authentication");
      
      try {
        // Check for hash in URL
        const hasHashParams = window.location.hash && window.location.hash.length > 1;
        
        if (hasHashParams) {
          console.log("ResetPasswordPage: Hash params detected, exchanging code for session");
          
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (error) {
            console.error("ResetPasswordPage: Exchange code error:", error);
            throw error;
          }
          
          // Get current session to confirm we have a valid session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log("ResetPasswordPage: Valid session obtained");
            setAuthenticated(true);
            
            // Clear the URL hash to prevent issues on refresh
            window.history.replaceState(null, "", window.location.pathname);
          } else {
            console.error("ResetPasswordPage: No session after code exchange");
            setError("Authentication failed. Please try again.");
            setTimeout(() => navigate("/auth"), 3000);
          }
        } else {
          // No hash in URL, check if we have a session already
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log("ResetPasswordPage: Existing session found");
            setAuthenticated(true);
          } else {
            console.log("ResetPasswordPage: No session and no hash params");
            setError("Invalid password reset link. Please request a new one.");
            setTimeout(() => navigate("/forgot-password"), 3000);
          }
        }
      } catch (e: any) {
        console.error("ResetPasswordPage: Auth processing error:", e);
        setError(e.message || "Failed to process authentication. Please try again.");
        setTimeout(() => navigate("/forgot-password"), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    processAuth();
  }, [navigate]);

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
        <div className="h-2 bg-gradient-to-r from-primary-100 to-primary-400" />
        <CardHeader>
          <CardTitle className="text-center">Set New Password</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Processing your password reset request...
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : authenticated ? (
            <ResetPasswordForm />
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Authentication failed. Redirecting to login page...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResetPasswordPage;
