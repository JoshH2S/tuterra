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

const HERO_URL =
  "https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/Untitled%20Project.jpg";

type AuthMode = "signIn" | "signUp" | "emailVerification" | "resetPassword" | "processing" | "error";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
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
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;

          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            const isPendingReset = localStorage.getItem("pendingPasswordReset") === "true";
            if (isPendingReset) {
              localStorage.removeItem("pendingPasswordReset");
              if (window.location.pathname === "/auth") {
                setMode("resetPassword");
              } else {
                navigate("/reset-password", { replace: true });
              }
            } else if (
              window.location.href.includes("email_confirmed=true") ||
              window.location.hash.includes("type=signup")
            ) {
              navigate("/verify-email", { replace: true });
              return;
            } else {
              navigate("/dashboard", { replace: true });
            }
          } else {
            setError("Authentication failed. Please try again.");
            setMode("error");
          }
        } catch (e: any) {
          setError(e.message || "Failed to process authentication. Please try again.");
          setMode("error");
        } finally {
          setIsProcessing(false);
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      } else {
        const email = queryParams.get("email");
        if (email) localStorage.setItem("pendingVerificationEmail", email);

        if (defaultTab === "signup") {
          setMode("signUp");
          setTab("signup");
        } else {
          setMode("signIn");
          setTab("signin");
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
          <PillTabSwitcher tab={tab} onChange={(t) => setTab(t)} />
          {tab === "signin" ? <SignInForm /> : <SignUpForm />}
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
          <>
            <PillTabSwitcher
              tab={tab}
              onChange={(t) => {
                setTab(t);
                setMode(t === "signup" ? "signUp" : "signIn");
              }}
            />
            {tab === "signin" ? <SignInForm /> : <SignUpForm />}
          </>
        );
    }
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#1a1208" }}>
      {/* ── MOBILE: stacked layout with full-bleed hero ── */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* ── Hero image section with text overlay ── */}
        <div className="relative w-full min-h-[44vh] flex flex-col justify-end">
          {/* Full-bleed hero image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${HERO_URL}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Gradient overlay: lighter at top, darker at bottom for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(26,18,8,0.95) 100%)",
            }}
          />

          {/* Logo at top */}
          <div className="relative z-10 px-5 pt-5">
            <img
              src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
              alt="tuterra.ai logo"
              className="h-7 w-auto brightness-0 invert"
            />
          </div>

          {/* Hero text overlaid on image */}
          <div className="relative z-10 px-5 pb-6 mt-auto">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#c9a96e] mb-2">
              AI-Powered Career Readiness
            </p>
            <h2 className="text-2xl font-bold text-white leading-tight mb-2">
              Your journey to career
              <br />
              excellence starts here.
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Build real-world skills through AI-powered virtual internships
              and personalized development tools.
            </p>
          </div>
        </div>

        {/* ── Card section (seamless transition from hero) ── */}
        <div className="flex-1 px-4 pb-4 -mt-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md mx-auto"
          >
            <div
              className="rounded-2xl p-6 space-y-5"
              style={{
                background: "rgba(255,255,255,0.09)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              {/* Card header */}
              <div className="space-y-1 text-center">
                <h1 className="text-xl font-semibold text-white tracking-tight">
                  {mode === "resetPassword"
                    ? "Reset password"
                    : mode === "emailVerification"
                    ? "Verify your email"
                    : tab === "signup"
                    ? "Create your account"
                    : "Welcome back"}
                </h1>
                <p className="text-sm text-white/40">
                  {mode === "resetPassword"
                    ? "Enter your new password below"
                    : mode === "emailVerification"
                    ? "Check your inbox to continue"
                    : tab === "signup"
                    ? "Start your career journey today"
                    : "Sign in to continue your journey"}
                </p>
              </div>
              {renderAuthContent()}
            </div>
          </motion.div>

          {/* Footer */}
          <p className="text-[11px] text-white/20 text-center mt-4 pb-2">
            © {new Date().getFullYear()} Tuterra. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── DESKTOP: original centered layout ── */}
      <div className="hidden lg:block relative min-h-screen overflow-hidden">
        {/* Background hero */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${HERO_URL}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(172,149,113,0.08) 0%, transparent 70%)",
              "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(26,18,8,0.4) 0%, transparent 100%)",
            ].join(", "),
          }}
        />

        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="flex-shrink-0 px-12 pt-10">
            <img
              src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
              alt="tuterra.ai logo"
              className="h-9 w-auto brightness-0 invert"
            />
          </div>

          <div className="flex-1 flex items-center justify-center py-0">
            <div className="w-full max-w-md flex flex-col items-center gap-6">
              <div className="flex flex-col items-center text-center">
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#c9a96e] mb-3">
                  AI-Powered Career Readiness
                </p>
                <h2 className="text-3xl font-bold text-white leading-tight mb-3">
                  Your journey to career
                  <br />
                  excellence starts here.
                </h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                  Build real-world skills through AI-powered virtual internships
                  and personalized development tools.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md"
              >
                <div
                  className="rounded-2xl p-9 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]"
                  style={{
                    background: "rgba(255,255,255,0.09)",
                    backdropFilter: "blur(28px)",
                    WebkitBackdropFilter: "blur(28px)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-semibold text-white tracking-tight">
                      {mode === "resetPassword"
                        ? "Reset password"
                        : mode === "emailVerification"
                        ? "Verify your email"
                        : tab === "signup"
                        ? "Create your account"
                        : "Welcome back"}
                    </h1>
                    <p className="text-sm text-white/40">
                      {mode === "resetPassword"
                        ? "Enter your new password below"
                        : mode === "emailVerification"
                        ? "Check your inbox to continue"
                        : tab === "signup"
                        ? "Start your career journey today"
                        : "Sign in to continue your journey"}
                    </p>
                  </div>
                  {renderAuthContent()}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex-shrink-0 px-12 pb-6">
            <p className="text-[11px] text-white/20 text-left">
              © {new Date().getFullYear()} Tuterra. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Pill tab switcher ──────────────────────────────────────────────────────────
interface PillTabSwitcherProps {
  tab: "signin" | "signup";
  onChange: (tab: "signin" | "signup") => void;
}

const PillTabSwitcher = ({ tab, onChange }: PillTabSwitcherProps) => (
  <div
    className="flex rounded-full p-1"
    style={{
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.10)",
    }}
  >
    {(["signin", "signup"] as const).map((t) => (
      <button
        key={t}
        type="button"
        onClick={() => onChange(t)}
        className="flex-1 py-2 text-sm font-medium transition-all duration-200 rounded-full"
        style={{
          border: "none",
          cursor: "pointer",
          background: tab === t ? "#ac9571" : "transparent",
          color: tab === t ? "#fff" : "rgba(255,255,255,0.45)",
        }}
      >
        {t === "signin" ? "Sign In" : "Sign Up"}
      </button>
    ))}
  </div>
);

export default Auth;
