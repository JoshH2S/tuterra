
import { useState } from "react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
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
        className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 lg:hidden safe-area-bottom"
      >
        <nav className="flex items-center justify-around p-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="touch-manipulation h-12 w-12 rounded-full"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="p-0 w-[80%] sm:w-[350px] border-r"
              hideCloseButton
            >
              <MobileMenu onClose={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
        </nav>
      </motion.div>

      {/* Quick Action Buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2 z-50 lg:hidden">
        <QuickActionButtons />
      </div>
    </>
  );
}
