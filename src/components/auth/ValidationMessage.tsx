
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationMessageProps {
  type: 'success' | 'error';
  message: string;
}

export const ValidationMessage = ({ type, message }: ValidationMessageProps) => {
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-2 text-sm p-2 rounded-md",
        type === 'success' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
};
