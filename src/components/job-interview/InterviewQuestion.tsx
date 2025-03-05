
import { motion, AnimatePresence } from "framer-motion";
import { TextShimmer } from "@/components/ui/text-shimmer";

interface InterviewQuestionProps {
  message: string;
  transcriptLength: number;
}

export const InterviewQuestion = ({ message, transcriptLength }: InterviewQuestionProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`message-${transcriptLength}-${message}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ 
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1],
          opacity: { duration: 0.3 }
        }}
        className="text-lg md:text-xl max-w-xl mx-auto relative"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <TextShimmer
            duration={2}
            className="font-medium [--base-color:theme(colors.primary.400)] [--base-gradient-color:theme(colors.primary.300)] dark:[--base-color:theme(colors.primary.500)] dark:[--base-gradient-color:theme(colors.primary.300)]"
          >
            {message}
          </TextShimmer>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "linear"
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
