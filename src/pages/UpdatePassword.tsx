
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UpdatePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validatePasswords = () => {
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    setError("");
    return true;
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;

    setLoading(true);
    
    try {
      // First verify the current password by attempting to sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: await getCurrentUserEmail(),
        password: currentPassword
      });

      if (signInError) {
        setError("Current password is incorrect");
        setLoading(false);
        return;
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Send confirmation email
      await sendPasswordChangeNotification();

      toast({
        title: "Success",
        description: "Your password has been updated successfully. A confirmation email has been sent to your inbox.",
        duration: 5000,
      });
      
      navigate("/profile-settings");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update password",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserEmail = async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email || "";
  };

  const sendPasswordChangeNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) throw new Error("User email not found");
      
      await supabase.functions.invoke("send-password-change-email", {
        body: { email: user.email },
      });
    } catch (error) {
      console.error("Failed to send notification email:", error);
      // We don't want to block the password update if just the email fails
    }
  };

  return (
    <div className="container px-4 max-w-md mx-auto py-6 sm:py-8 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Update Password</CardTitle>
          <CardDescription>Securely update your account password</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordUpdate}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter your new password"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Confirm your new password"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto order-2 sm:order-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </span>
              ) : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UpdatePassword;
