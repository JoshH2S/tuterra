
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ProfileSetup } from "./ProfileSetup";

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
        className="h-[100dvh] p-0 sm:max-w-none"
        hideCloseButton
      >
        {!showProfileSetup ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-full px-4 py-6 sm:px-6 bg-gradient-to-b from-white to-gray-50"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-[180px] mb-8"
            >
              <img 
                src="/lovable-uploads/ab68bba9-f2b9-4344-9799-6209be49e097.png"
                alt="EduPortal Logo" 
                className="w-full h-auto"
              />
            </motion.div>
            
            {/* Welcome Message */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="max-w-md text-center space-y-4 mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-800">Welcome to EduPortal!</h1>
              <p className="text-gray-600 leading-relaxed">
                At EduPortal, we believe in more than just providing learning tools. As the world evolves, so should education. Our goal is to bridge the gap between the classroom and the real world, offering support and resources to help you thrive. We're here to give you the best chance of achieving success in your learning journey and beyond.
              </p>
            </motion.div>
            
            {/* Call to Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg font-medium shadow-md rounded-full bg-primary hover:bg-primary/90"
                onClick={handleStartProfileSetup}
              >
                Build My Profile
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <ProfileSetup onComplete={handleCompleteSetup} />
        )}
      </SheetContent>
    </Sheet>
  );
};
