import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, XCircle } from "lucide-react";
import { PasswordRequirements } from "./PasswordRequirements";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { validatePasswordRequirements } from "@/lib/password";

const glassInputClass =
  "flex h-11 w-full rounded-full border bg-white/10 border-white/15 px-4 py-2 pl-10 pr-10 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ac9571]/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

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
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className={glassInputClass}
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
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
          </button>
        </div>
        <p className="text-xs italic text-white/30 px-4">
          At least 8 characters with uppercase, lowercase, number, and special character.
        </p>
      </div>

      {password && (
        <>
          <PasswordRequirements password={password} />
          <PasswordStrengthMeter password={password} strength={passwordStrength} />
        </>
      )}

      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          className={glassInputClass}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={validatePassword}
          required
        />
        <button
          type="button"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          tabIndex={-1}
        >
          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
        </button>
      </div>

      {passwordError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300"
        >
          <XCircle className="h-4 w-4 flex-shrink-0" />
          <span>{passwordError}</span>
        </motion.div>
      )}
    </>
  );
};
