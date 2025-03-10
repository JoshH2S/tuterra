
import { useState } from "react";
import { motion } from "framer-motion";
import { User, AtSign, Lock, Building, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [school, setSchool] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const { toast } = useToast();

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            school: school,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Check your email for the confirmation link.",
      });
    } catch (error: any) {
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
        <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your details to get started
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="First Name"
                className="pl-10"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Last Name"
                className="pl-10"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Confirm password"
              className="pl-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {passwordError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 text-sm p-2 rounded-md bg-red-50 text-red-600"
            >
              <XCircle className="h-4 w-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </motion.div>
          )}

          <div className="relative">
            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="School"
              className="pl-10"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              required
            />
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
              <span>Creating account...</span>
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </motion.div>
  );
};
