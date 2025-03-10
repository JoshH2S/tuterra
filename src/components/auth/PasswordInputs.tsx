
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordRequirements } from "./PasswordRequirements";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { validatePasswordRequirements } from "@/lib/password";

interface PasswordInputsProps {
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  passwordError: string;
  setPasswordError: (value: string) => void;
  passwordStrength: number;
  setPasswordTouched: (value: boolean) => void;
  passwordTouched: boolean;
  validatePassword: () => boolean;
}

export const PasswordInputs = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  setPasswordError,
  passwordStrength,
  setPasswordTouched,
  passwordTouched,
  validatePassword,
}: PasswordInputsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (password) {
      // Clear password error if all requirements are met
      const { allMet } = validatePasswordRequirements(password);
      if (allMet && passwordError === "Password doesn't meet requirements") {
        setPasswordError("");
      }
    }
  }, [password, passwordError, setPasswordError]);

  return (
    <>
      <div className="space-y-1">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="pl-10 pr-10"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (!passwordTouched) setPasswordTouched(true);
            }}
            onBlur={validatePassword}
            required
          />
          <button 
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </button>
        </div>
        <p className="text-xs italic text-muted-foreground px-1">
          Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character.
        </p>
      </div>

      {/* Password strength and requirements (only show when password field is not empty) */}
      {password && (
        <>
          <PasswordRequirements password={password} />
          <PasswordStrengthMeter password={password} strength={passwordStrength} />
        </>
      )}

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          className="pl-10 pr-10"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={validatePassword}
          required
        />
        <button 
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          tabIndex={-1}
        >
          {showConfirmPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="sr-only">
            {showConfirmPassword ? "Hide password" : "Show password"}
          </span>
        </button>
      </div>

      {/* Password error feedback */}
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
    </>
  );
};
