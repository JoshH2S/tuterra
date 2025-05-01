
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processingToken, setProcessingToken] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Process the token from the URL
  useEffect(() => {
    const processToken = async () => {
      try {
        // Check for hash fragments which indicate a token is present
        if (window.location.hash) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (error) {
            setTokenError("Invalid or expired reset link. Please request a new one.");
            toast({
              title: "Error",
              description: "Invalid or expired reset link. Please request a new one.",
              variant: "destructive",
            });
          }
        } else {
          // No token in URL, user may have navigated here directly
          setTokenError("No reset token found. Please request a password reset from the login page.");
        }
      } catch (err: any) {
        setTokenError(err.message || "Failed to process reset link");
      } finally {
        setProcessingToken(false);
      }
    };
    
    processToken();
  }, [toast]);

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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      setMessage("Your password has been updated successfully");
      toast({
        title: "Success",
        description: "Your password has been updated successfully",
      });
      
      // Redirect to login after a delay
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

  // Show loading state while processing token
  if (processingToken) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-center text-sm text-muted-foreground">
          Processing your reset link...
        </p>
      </div>
    );
  }

  // Show error if token processing failed
  if (tokenError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{tokenError}</AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate("/auth")}
          className="w-full"
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
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
    </motion.div>
  );
};
