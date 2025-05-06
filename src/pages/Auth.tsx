
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { EmailVerification } from "@/components/auth/EmailVerification";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

type AuthMode = "signIn" | "signUp" | "emailVerification" | "resetPassword" | "processing" | "error";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get("tab") || "signin";

  // Handle auth actions from URL (verification, password reset, magic link)
  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check if hash or query params exist in URL
      const hasHashParams = window.location.hash && window.location.hash.length > 1;
      
      if (hasHashParams) {
        // Set processing state
        setIsProcessing(true);
        setMode("processing");
        
        try {
          console.log("Processing auth redirect with hash params");
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (error) {
            throw error;
          }
          
          // Get current session
          const { data: { session } } = await supabase.auth.getSession();
          
          // Determine auth flow based on URL, session state, and localStorage flags
          if (session) {
            // Check if this is a password reset flow by checking for the pendingPasswordReset flag
            if (localStorage.getItem("pendingPasswordReset") === "true") {
              localStorage.removeItem("pendingPasswordReset"); // Clear the flag
              setMode("resetPassword");
            } 
            // If email was just verified (emailVerified is true in URL)
            else if (window.location.href.includes("email_confirmed=true") || window.location.hash.includes("type=signup")) {
              setMode("emailVerification");
            }
            // Otherwise, it's a successful sign-in
            else {
              // If user is fully set up, redirect to dashboard
              navigate("/dashboard", { replace: true });
            }
          } else {
            // If no session, likely an error occurred
            setError("Authentication failed. Please try again.");
            setMode("error");
          }
        } catch (e: any) {
          console.error("Auth redirect error:", e);
          setError(e.message || "Failed to process authentication. Please try again.");
          setMode("error");
        } finally {
          setIsProcessing(false);
          // Clear hash from URL without reloading
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      } else {
        // Check if there's an email in the URL (from a redirection)
        const email = queryParams.get("email");
        if (email) {
          localStorage.setItem("pendingVerificationEmail", email);
        }
        
        // Set default tab from URL if present
        if (defaultTab === "signup") {
          setMode("signUp");
        } else {
          setMode("signIn");
        }
      }
    };
    
    handleAuthRedirect();
  }, [location, navigate, defaultTab]);

  // Display correct component based on mode
  const renderAuthContent = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            Processing your authentication...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
        </div>
      );
    }

    switch (mode) {
      case "emailVerification":
        return <EmailVerification />;
      case "resetPassword":
        return <ResetPasswordForm />;
      case "signIn":
      case "signUp":
      default:
        return (
          <Tabs defaultValue={mode === "signUp" ? "signup" : "signin"} className="w-full">
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
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <Card className="w-full max-w-md shadow-lg border-0 mb-8">
        <CardHeader>
          <CardTitle className="text-center text-[#ac9571]">Welcome to Tuterra</CardTitle>
        </CardHeader>
        <CardContent>
          {renderAuthContent()}
        </CardContent>
      </Card>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-[200px]"
      >
        <img
          alt="Tuterra Logo"
          className="w-full h-auto"
          src="/lovable-uploads/ab68bba9-f2b9-4344-9799-6209be49e097.png"
        />
      </motion.div>
    </motion.div>
  );
};

export default Auth;
