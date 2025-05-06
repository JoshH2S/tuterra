
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { calculatePasswordStrength } from "@/lib/password";

export const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Calculate password strength when password changes
    setPasswordStrength(calculatePasswordStrength(newPassword));
  }, [newPassword]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      console.log("Updating user password");
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      setMessage("Your password has been updated successfully");
      toast({
        title: "Success",
        description: "Your password has been updated successfully",
      });
      
      console.log("Password updated successfully, redirecting to dashboard");
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error("Password update error:", error);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#ac9571]">
          Set New Password
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your new password below
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

      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="pr-10"
            />
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <p className="text-xs text-muted-foreground mt-1">
              Password must be at least 6 characters
            </p>
            
            {/* Show password strength meter */}
            {newPassword.length > 0 && (
              <div className="mt-2">
                <PasswordStrengthMeter strength={passwordStrength} />
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="pr-10"
            />
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
          size="lg"
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
      </form>
    </motion.div>
  );
};
