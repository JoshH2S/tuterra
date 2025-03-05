
import { motion } from "framer-motion";

export const InterviewTypingIndicator = () => {
  return (
    <motion.div
      key="typing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="typing-indicator space-x-2 flex"
    >
      <div className="dot w-3 h-3 bg-primary rounded-full animate-bounce"></div>
      <div className="dot w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
      <div className="dot w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
    </motion.div>
  );
};
