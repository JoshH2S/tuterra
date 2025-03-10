
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ProfileSetup } from "./ProfileSetup";
import { ChevronRight, ArrowRight, Sparkles } from "lucide-react";

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomePopup = ({ isOpen, onClose }: WelcomePopupProps) => {
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const handleStartProfileSetup = () => {
    setShowProfileSetup(true);
  };

  const handleCompleteSetup = () => {
    setShowProfileSetup(false);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-[100dvh] p-0 sm:max-w-none overflow-hidden"
        hideCloseButton
      >
        <AnimatePresence mode="wait">
          {!showProfileSetup ? (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full px-4 py-6 sm:px-6 overflow-y-auto"
              style={{
                backgroundImage: "radial-gradient(circle at 10% 20%, rgba(255, 215, 104, 0.1) 0%, rgba(255, 255, 255, 1) 90%)"
              }}
            >
              {/* Logo with animation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="w-[180px] mb-8 relative"
              >
                <img 
                  src="/lovable-uploads/ab68bba9-f2b9-4344-9799-6209be49e097.png"
                  alt="EduPortal Logo" 
                  className="w-full h-auto"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4, type: "spring" }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-primary" />
                </motion.div>
              </motion.div>
              
              {/* Welcome Message with staggered animation */}
              <div className="max-w-md text-center space-y-4 mb-10">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl font-bold text-gray-800"
                >
                  Welcome to EduPortal!
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-gray-600 leading-relaxed"
                >
                  At EduPortal, we believe in more than just providing learning tools. As the world evolves, so should education. Our goal is to bridge the gap between the classroom and the real world, offering support and resources to help you thrive.
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="text-gray-600 leading-relaxed"
                >
                  We're here to give you the best chance of achieving success in your learning journey and beyond.
                </motion.p>
              </div>
              
              {/* Call to Action Button with animation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-full max-w-xs"
              >
                <Button 
                  size="lg" 
                  className="w-full py-6 text-lg font-medium shadow-md rounded-full bg-primary hover:bg-primary/90 group touch-manipulation"
                  onClick={handleStartProfileSetup}
                >
                  <span>Build My Profile</span>
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
              {/* Mobile notes */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-xs text-gray-500 mt-8 text-center"
              >
                Swipe through the steps to complete your profile setup
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="profile-setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ProfileSetup onComplete={handleCompleteSetup} />
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};
