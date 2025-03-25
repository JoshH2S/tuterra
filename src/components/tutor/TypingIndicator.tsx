
import { motion } from "framer-motion";

export const TypingIndicator = () => {
  return (
    <motion.div 
      className="flex items-center gap-1 px-4 py-2.5 bg-muted rounded-2xl rounded-tl-sm w-fit max-w-[80%] shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex space-x-1">
        <motion.div 
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ y: ["0px", "-5px", "0px"] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 1] }}
        />
        <motion.div 
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ y: ["0px", "-5px", "0px"] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 1], delay: 0.2 }}
        />
        <motion.div 
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ y: ["0px", "-5px", "0px"] }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 1], delay: 0.4 }}
        />
      </div>
      <span className="text-xs text-muted-foreground">AI is typing...</span>
    </motion.div>
  );
};
