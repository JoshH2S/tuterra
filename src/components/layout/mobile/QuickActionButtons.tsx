
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActionButtons() {
  // Staggered animation for each button
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <motion.div
        variants={itemVariants}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="icon"
          variant="default"
          className="h-14 w-14 rounded-full shadow-lg touch-manipulation bg-primary text-white border-none active:scale-95 transition-transform"
          asChild
        >
          <Link to="/tutor">
            <Brain className="h-6 w-6" />
            <span className="sr-only">AI Tutor</span>
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
