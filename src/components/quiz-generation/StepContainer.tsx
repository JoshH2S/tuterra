
import React from "react";
import { motion } from "framer-motion";

interface StepContainerProps {
  children: React.ReactNode;
}

export const StepContainer = ({ children }: StepContainerProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="mb-6"
  >
    {children}
  </motion.div>
);
