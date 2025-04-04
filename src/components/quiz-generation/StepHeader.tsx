
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StepHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const StepHeader = ({ title, description, icon: Icon }: StepHeaderProps) => {
  return (
    <motion.div 
      className="flex items-start gap-4 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mt-1 p-2 bg-primary/10 text-primary rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </motion.div>
  );
};
