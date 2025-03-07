
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenu } from "./MobileMenu";
import { QuickActionButtons } from "./QuickActionButtons";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t z-50 lg:hidden safe-area-bottom"
      >
        <nav className="flex items-center justify-around p-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="touch-manipulation h-14 w-14 rounded-full flex items-center justify-center bg-white/20 shadow-sm border border-gray-200/30 active:scale-95 transition-transform"
              >
                <Menu className="h-6 w-6 text-primary" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="p-0 w-[85%] sm:w-[350px] border-r shadow-xl"
              hideCloseButton
            >
              <MobileMenu onClose={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
        </nav>
      </motion.div>

      {/* Quick Action Buttons */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
          className="fixed bottom-24 right-4 flex flex-col gap-2 z-50 lg:hidden"
        >
          <QuickActionButtons />
          
          {/* Back to top button with improved mobile touch */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="touch-manipulation h-14 w-14 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200/30 active:scale-95 transition-transform"
          >
            <ChevronUp className="h-6 w-6 text-primary" />
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
