
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AtSign, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false);
  const { search } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a #access_token in the URL, which indicates the user clicked the reset link
    const accessToken = window.location.hash?.split("&")?.find(part => part.startsWith("#access_token="))?.split("=")[1];
    if (accessToken) {
      setIsSettingNewPassword(true);
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=resetPassword`,
      });
      
      if (error) throw error;
      
      setMessage("Check your email for the password reset link");
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      setMessage("Your password has been updated successfully");
      toast({
        title: "Success",
        description: "Your password has been updated successfully",
      });
      
      // Navigate to sign in page after a short delay
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
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
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          {isSettingNewPassword ? "Set New Password" : "Reset Password"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isSettingNewPassword 
            ? "Enter your new password below" 
            : "Enter your email and we'll send you a reset link"
          }
        </p>
      </div>

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

      {isSettingNewPassword ? (
        <form onSubmit={handleSetNewPassword} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 6 characters
              </p>
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      ) : (
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
      )}
    </motion.div>
  );
};
