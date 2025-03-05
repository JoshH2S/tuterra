
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const InterviewCompleted = () => {
  return (
    <motion.div
      key="completed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-4 p-4 max-w-[90%] md:max-w-md mx-auto"
    >
      <h3 className="text-xl font-medium">Interview Completed!</h3>
      <p className="text-muted-foreground">
        Thank you for participating. You can now download your interview transcript.
      </p>
      <Button variant="outline" className="gap-2 w-full md:w-auto md:px-4">
        <Download className="h-4 w-4" />
        Download Transcript
      </Button>
    </motion.div>
  );
};
