
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "warning";
  action?: React.ReactNode;
};

export const toast = ({ title, description, variant, action }: ToastProps) => {
  return sonnerToast[variant === "destructive" ? "error" : variant === "warning" ? "warning" : "success"]({
    title,
    description,
    action
  });
};

export const useToast = () => {
  return {
    toast
  };
};
