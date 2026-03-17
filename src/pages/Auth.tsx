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
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
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
            } else if (window.location.href.includes("email_confirmed=true") || window.location.hash.includes("type=signup")) {
              console.log("Email verification detected, redirecting to /verify-email");
              navigate("/verify-email", { replace: true });
              return;
            } else {
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
          setActiveTab("signup");
        } else {
          setMode("signIn");
          setActiveTab("signin");
        }
      }
    };

    handleAuthRedirect();
  }, [location, navigate, defaultTab]);

  const renderAuthContent = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#c9a96e]" />
          <p className="text-center text-white/50">
            Processing your authentication...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-6">
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-300">
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
    <div className="w-full space-y-6">
      {/* Custom pill tab switcher */}
      <div className="flex rounded-full p-1" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <button
          type="button"
          onClick={() => { setActiveTab("signin"); setMode("signIn"); }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
            activeTab === "signin"
              ? "bg-[#ac9571] text-white shadow-lg"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("signup"); setMode("signUp"); }}
          className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
            activeTab === "signup"
              ? "bg-[#ac9571] text-white shadow-lg"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "signin" && (
        <motion.div
          key="signin"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Sign in to continue your journey
            </p>
          </div>
          <SignInForm />
        </motion.div>
      )}

      {activeTab === "signup" && (
        <motion.div
          key="signup"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Enter your details to get started
            </p>
          </div>
          <SignUpForm />
        </motion.div>
      )}
    </div>
  );

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${HERO_URL}') center/cover no-repeat`,
        backgroundColor: "#1a1208",
      }}
    >
      {/* Radial gradient atmosphere layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(172,149,113,0.15) 0%, transparent 70%)",
            "radial-gradient(ellipse 60% 50% at 80% 20%, rgba(100,65,5,0.12) 0%, transparent 60%)",
            "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(26,18,8,0.4) 0%, transparent 100%)",
          ].join(", "),
        }}
      />

      {/* Logo — top-left */}
      <Link to="/" className="absolute top-8 left-8 z-20 lg:top-10 lg:left-12">
        <img
          src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
          alt="tuterra.ai logo"
          className="h-8 lg:h-10 w-auto brightness-0 invert"
        />
      </Link>

      {/* Hero copy — bottom-left (desktop only) */}
      <div className="hidden lg:block absolute bottom-12 left-12 z-10 max-w-lg">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#c9a96e] mb-4">
          AI-Powered Career Readiness
        </p>
        <h2 className="text-3xl font-bold text-white leading-tight mb-4">
          Your journey to career excellence starts here.
        </h2>
        <p className="text-white/40 text-sm leading-relaxed">
          Join thousands of students building real-world skills through AI-powered virtual internships, personalized courses, and professional development tools.
        </p>
        <p className="text-white/20 text-xs mt-8">
          © {new Date().getFullYear()} Tuterra. All rights reserved.
        </p>
      </div>

      {/* Glass card — right-center on desktop, centered on mobile */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          relative z-20
          w-full max-w-md mx-auto mt-24 mb-8 px-4
          lg:absolute lg:right-12 lg:top-1/2 lg:-translate-y-1/2 lg:mx-0 lg:mt-0 lg:mb-0 lg:px-0
          xl:right-16
        "
      >
        <div
          className="rounded-2xl p-8 lg:p-10"
          style={{
            background: "rgba(255,255,255,0.09)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {/* Mobile logo (inside card) */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Link to="/">
              <img
                src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
                alt="tuterra.ai logo"
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
          </div>

          {renderAuthContent()}
        </div>

        {/* Mobile copyright */}
        <p className="text-center text-white/20 text-xs mt-6 lg:hidden">
          © {new Date().getFullYear()} Tuterra. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
