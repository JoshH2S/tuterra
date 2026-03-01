
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
      className="flex items-center gap-2 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="w-5 h-5 text-stone-400 shrink-0" />
      <div>
        <h2 className="text-xl md:text-2xl font-normal tracking-tight text-[#091747]">{title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed mt-0.5">{description}</p>
      </div>
    </motion.div>
  );
};
