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
import { Link } from "react-router-dom";

const HERO_URL =
  "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/Untitled%20Project.jpg";

type AuthMode = "signIn" | "signUp" | "emailVerification" | "resetPassword" | "processing" | "error";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get("tab") || "signin";

  useEffect(() => {
    console.log("Auth page: Current URL:", window.location.href);
    console.log("Auth page: Hash present:", !!window.location.hash);
    console.log("Auth page: pendingPasswordReset flag:", localStorage.getItem("pendingPasswordReset"));
  }, []);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const hasHashParams = window.location.hash && window.location.hash.length > 1;
      
      if (hasHashParams) {
        setIsProcessing(true);
        setMode("processing");
        
        try {
          console.log("Processing auth redirect with hash params");
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (error) {
            console.error("Exchange code error:", error);
            throw error;
          }
          
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const isPendingReset = localStorage.getItem("pendingPasswordReset") === "true";
            console.log("Is pending reset:", isPendingReset);
            
            if (isPendingReset) {
              localStorage.removeItem("pendingPasswordReset");
              if (window.location.pathname === "/auth") {
                setMode("resetPassword");
              } else {
                navigate("/reset-password", { replace: true });
              }
            } 
            else if (window.location.href.includes("email_confirmed=true") || window.location.hash.includes("type=signup")) {
              console.log("Email verification detected, redirecting to /verify-email");
              navigate("/verify-email", { replace: true });
              return;
            }
            else {
              console.log("Redirecting to dashboard - successful auth");
              navigate("/dashboard", { replace: true });
            }
          } else {
            console.error("No session after code exchange");
            setError("Authentication failed. Please try again.");
            setMode("error");
          }
        } catch (e: any) {
          console.error("Auth redirect error:", e);
          setError(e.message || "Failed to process authentication. Please try again.");
          setMode("error");
        } finally {
          setIsProcessing(false);
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      } else {
        const email = queryParams.get("email");
        if (email) {
          localStorage.setItem("pendingVerificationEmail", email);
        }
        
        if (defaultTab === "signup") {
          setMode("signUp");
        } else {
          setMode("signIn");
        }
      }
    };
    
    handleAuthRedirect();
  }, [location, navigate, defaultTab]);

  const renderAuthContent = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            Processing your authentication...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {renderTabs()}
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
        return renderTabs();
    }
  };

  const renderTabs = () => (
    <Tabs
      defaultValue={mode === "signUp" ? "signup" : "signin"}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 rounded-full p-1 h-11">
        <TabsTrigger
          value="signin"
          className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium transition-all"
        >
          Sign In
        </TabsTrigger>
        <TabsTrigger
          value="signup"
          className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium transition-all"
        >
          Sign Up
        </TabsTrigger>
      </TabsList>
      <TabsContent value="signin" className="mt-0">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to continue your journey
          </p>
        </div>
        <SignInForm />
      </TabsContent>
      <TabsContent value="signup" className="mt-0">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Create your account
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter your details to get started
          </p>
        </div>
        <SignUpForm />
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left panel — hero image (hidden on mobile) */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_URL}')` }}
        />
        {/* Gold overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(72,46,0,0.92) 0%, rgba(100,65,5,0.80) 40%, rgba(150,100,10,0.50) 70%, transparent 100%)",
          }}
        />
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <Link to="/">
            <img
              src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
              alt="tuterra.ai logo"
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <div className="max-w-md">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#C8A84B] mb-4">
              AI-Powered Career Readiness
            </p>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Your journey to career excellence starts here.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Join thousands of students building real-world skills through AI-powered virtual internships, personalized courses, and professional development tools.
            </p>
          </div>
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Tuterra. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-8 lg:py-12 overflow-y-auto"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Link to="/">
              <img
                src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
                alt="tuterra.ai logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {renderAuthContent()}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
