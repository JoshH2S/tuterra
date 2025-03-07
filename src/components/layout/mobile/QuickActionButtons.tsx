
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUp, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActionButtons() {
  return (
    <motion.div layout className="space-y-2">
      <Button
        size="icon"
        variant="default"
        className="rounded-full shadow-lg h-12 w-12 touch-manipulation"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp className="h-5 w-5" />
        <span className="sr-only">Scroll to top</span>
      </Button>
      <Button
        size="icon"
        variant="default"
        className="rounded-full shadow-lg h-12 w-12 touch-manipulation"
        asChild
      >
        <Link to="/tutor">
          <Brain className="h-5 w-5" />
          <span className="sr-only">AI Tutor</span>
        </Link>
      </Button>
    </motion.div>
  );
}
