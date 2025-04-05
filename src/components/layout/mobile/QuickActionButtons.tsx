
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Book, Calculator, MessageSquare } from "lucide-react";
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

  const actions = [
    { icon: Brain, label: "AI Tutor", path: "/tutor" },
    { icon: Book, label: "Courses", path: "/courses" },
    { icon: Calculator, label: "Assessments", path: "/skill-assessments" },
    { icon: MessageSquare, label: "Interview", path: "/job-interview-simulator" },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.path}
          variants={itemVariants}
          whileTap={{ scale: 0.95 }}
          className="touch-manipulation"
        >
          <Button
            size="icon"
            variant="default"
            className="h-14 w-14 rounded-full shadow-lg touch-manipulation bg-gradient-to-br from-primary-100/80 to-primary-200/80 text-primary-foreground border-none active:scale-95 transition-transform"
            asChild
          >
            <Link to={action.path}>
              <action.icon className="h-6 w-6 text-muted-foreground" />
              <span className="sr-only">{action.label}</span>
            </Link>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
