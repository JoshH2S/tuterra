import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const variantIcon = {
  destructive: <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />,
  default: <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />,
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const icon = variantIcon[(props.variant as keyof typeof variantIcon) ?? "default"] ?? variantIcon.default
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3 w-full">
              {icon}
              <div className="grid gap-0.5 flex-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
