
import { motion } from "framer-motion";
import { TextShimmer } from "@/components/ui/text-shimmer";

interface InterviewQuestionProps {
  message: string;
  transcriptLength: number;
}

export const InterviewQuestion = ({ message, transcriptLength }: InterviewQuestionProps) => {
  return (
    <motion.div
      key={`message-${transcriptLength}-${message}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="text-lg md:text-xl max-w-xl mx-auto"
    >
      <TextShimmer
        duration={1.5}
        className="font-medium [--base-color:theme(colors.primary.400)] [--base-gradient-color:theme(colors.primary.300)] dark:[--base-color:theme(colors.primary.500)] dark:[--base-gradient-color:theme(colors.primary.300)]"
      >
        {message}
      </TextShimmer>
    </motion.div>
  );
};
