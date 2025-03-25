
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StrengthLevel = "weak" | "medium" | "strong" | "very-strong";

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const strength = calculatePasswordStrength(password);
  
  const getStrengthLabel = (strength: StrengthLevel): string => {
    switch (strength) {
      case "weak": return "Weak";
      case "medium": return "Medium";
      case "strong": return "Strong";
      case "very-strong": return "Very Strong";
      default: return "Weak";
    }
  };
  
  const getStrengthColor = (strength: StrengthLevel): string => {
    switch (strength) {
      case "weak": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "strong": return "text-green-500";
      case "very-strong": return "text-emerald-500";
      default: return "text-red-500";
    }
  };
  
  const getStrengthBackground = (strength: StrengthLevel): string => {
    switch (strength) {
      case "weak": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "strong": return "bg-green-500";
      case "very-strong": return "bg-emerald-500";
      default: return "bg-red-500";
    }
  };
  
  const getStrengthPercentage = (strength: StrengthLevel): string => {
    switch (strength) {
      case "weak": return "25%";
      case "medium": return "50%";
      case "strong": return "75%";
      case "very-strong": return "100%";
      default: return "0%";
    }
  };

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex justify-between text-xs">
        <span>Password strength</span>
        <span className={getStrengthColor(strength)}>{getStrengthLabel(strength)}</span>
      </div>
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full", getStrengthBackground(strength))}
          initial={{ width: "0%" }}
          animate={{ width: getStrengthPercentage(strength) }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

// Function to calculate password strength
function calculatePasswordStrength(password: string): StrengthLevel {
  if (!password) return "weak";
  
  // Calculate strength based on password characteristics
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1; // Uppercase
  if (/[a-z]/.test(password)) score += 1; // Lowercase
  if (/[0-9]/.test(password)) score += 1; // Numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // Special characters
  
  // Return strength based on score
  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  if (score <= 5) return "strong";
  return "very-strong";
}
