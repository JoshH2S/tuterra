
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useJobInterview } from "@/hooks/useJobInterview";

export const InterviewCompleted = () => {
  const { transcript } = useJobInterview();
  
  return (
    <motion.div
      key="completed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-4 p-4 max-w-[90%] md:max-w-md mx-auto"
    >
      <h3 className="text-xl font-medium">Interview Completed!</h3>
      <p className="text-muted-foreground mb-4">
        Thank you for participating. You can now download your interview transcript.
      </p>
    </motion.div>
  );
};
