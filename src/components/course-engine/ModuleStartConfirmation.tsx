import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { CourseModule } from "@/types/course-engine";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleStartConfirmationProps {
  open: boolean;
  module: CourseModule | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModuleStartConfirmation({
  open,
  module,
  onConfirm,
  onCancel,
}: ModuleStartConfirmationProps) {
  if (!module) return null;

  const moduleNumber = String(module.module_index + 1).padStart(2, "0");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogPortal>
        <DialogOverlay className="bg-[#1a1308]/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "overflow-hidden rounded-2xl border border-primary-300/50 bg-gradient-to-b from-brand-light to-white",
            "shadow-[0_24px_60px_-12px_rgba(74,52,3,0.3),0_8px_24px_-8px_rgba(184,134,11,0.2),inset_0_1px_0_0_rgba(255,255,255,0.9)]",
            "duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          {/* Hairline gold accent at the very top */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary-400 to-transparent" />

          <div className="px-8 pt-10 pb-8">
            {/* Eyebrow: Module number + chapter callout */}
            <div className="flex items-center gap-3">
              <span className="font-bitter text-xs font-semibold uppercase tracking-[0.25em] text-primary-600">
                Module {moduleNumber}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-primary-300/60 to-transparent" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-muted">
                Next chapter
              </span>
            </div>

            {/* Serif display title */}
            <DialogPrimitive.Title asChild>
              <h2 className="mt-5 font-bitter text-3xl font-semibold leading-tight text-primary-900">
                {module.title}
              </h2>
            </DialogPrimitive.Title>

            {/* Summary as editorial body */}
            {module.summary && (
              <DialogPrimitive.Description asChild>
                <p className="mt-4 text-[15px] leading-relaxed text-neutral-text">
                  {module.summary}
                </p>
              </DialogPrimitive.Description>
            )}

            {/* Inline meta row */}
            {module.estimated_minutes && (
              <div className="mt-6 flex items-center gap-2 text-xs text-neutral-muted">
                <Clock className="h-3.5 w-3.5 text-primary-500" />
                <span className="tabular-nums">
                  {module.estimated_minutes} minutes
                </span>
                <span className="text-primary-300">·</span>
                <span>Self-paced</span>
              </div>
            )}

            {/* Decorative rule */}
            <div className="my-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-primary-300/40" />
              <span className="h-1 w-1 rotate-45 bg-primary-400" />
              <span className="h-px flex-1 bg-primary-300/40" />
            </div>

            {/* Concise expectation note */}
            <p className="text-center text-sm italic text-neutral-muted">
              We'll tailor your lesson content in the next few seconds.
            </p>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                className="text-sm font-medium text-neutral-muted transition-colors hover:text-primary-700"
              >
                Not yet
              </button>
              <Button
                onClick={onConfirm}
                size="lg"
                className={cn(
                  "min-w-[180px] bg-gradient-to-br from-primary-400 to-primary-600 text-white",
                  "shadow-[0_6px_20px_-6px_rgba(184,134,11,0.5)]",
                  "hover:from-primary-500 hover:to-primary-700 hover:shadow-[0_8px_24px_-6px_rgba(184,134,11,0.6)]",
                  "transition-all duration-200"
                )}
              >
                Begin Module
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
