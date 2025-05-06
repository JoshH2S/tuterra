
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AtSign, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      console.log("Setting pendingPasswordReset flag in localStorage");
      // Set a flag in localStorage to indicate a pending password reset
      localStorage.setItem("pendingPasswordReset", "true");
      
      // No need to specify emailRedirectTo - Supabase will use the Site URL configured in the dashboard
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      setMessage("Check your email for the password reset link");
      toast({
        title: "Reset link sent",
        description: "Check your email for the password reset link",
      });
      
      console.log("Password reset email sent successfully");
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message);
      // Clear the flag if there was an error
      localStorage.removeItem("pendingPasswordReset");
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-[#ac9571]">Reset Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <div className="space-y-4">
        {message && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleRequestReset} className="space-y-4">
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="flex-1"
            >
              Back to Sign In
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
