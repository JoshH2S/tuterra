
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CheckoutAlertProps {
  show: boolean;
}

export function CheckoutAlert({ show }: CheckoutAlertProps) {
  if (!show) return null;
  
  return (
    <Alert variant="warning" className="max-w-md mx-auto mb-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Checkout Canceled</AlertTitle>
      <AlertDescription>
        Your subscription process was canceled. You can try again when you're ready.
      </AlertDescription>
    </Alert>
  );
}
