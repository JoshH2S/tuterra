
import * as React from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialSnapPoint?: "full" | "half" | "quarter";
  className?: string;
}

export function MobileSheet({ 
  isOpen, 
  onClose, 
  children, 
  initialSnapPoint = "half",
  className
}: MobileSheetProps) {
  const [snapPoint, setSnapPoint] = React.useState<"full" | "half" | "quarter">(initialSnapPoint);
  const dragY = useMotionValue(0);
  
  // Calculate sheet height based on snap point
  const getSheetHeight = (point: "full" | "half" | "quarter") => {
    switch (point) {
      case "full": return "0%";
      case "half": return "50%";
      case "quarter": return "75%";
    }
  };

  // Transform dragY to background opacity
  const bgOpacity = useTransform(
    dragY,
    [0, 300],
    [0.5, 0]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            style={{ opacity: bgOpacity }}
            className="fixed inset-0 bg-black/50 z-50 touch-none"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ 
              y: getSheetHeight(snapPoint),
              transition: { type: "spring", damping: 30, stiffness: 300 }
            }}
            exit={{ y: "100%" }}
            style={{ y: dragY }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDrag={(_, info) => {
              // Don't allow dragging up beyond the top constraint
              if (info.offset.y < 0 && snapPoint === "full") {
                dragY.set(0);
              }
            }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 200) {
                onClose();
              } else if (info.offset.y > 100 && snapPoint === "full") {
                setSnapPoint("half");
              } else if (info.offset.y < -100 && snapPoint === "half") {
                setSnapPoint("full");
              } else if (info.offset.y > 100 && snapPoint === "half") {
                setSnapPoint("quarter");
              } else if (info.offset.y < -100 && snapPoint === "quarter") {
                setSnapPoint("half");
              }
              dragY.set(0);
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-[20px] overflow-hidden touch-manipulation safe-area-bottom",
              className
            )}
          >
            <div className="flex justify-center p-2">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>
            <div className="max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain momentum-scroll">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
