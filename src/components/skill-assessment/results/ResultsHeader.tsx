
import { ChevronLeft, Download, Share, ArrowUpRight, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ResultsHeaderProps {
  title: string;
  createdAt: string;
  level?: string;
  userTier: string;
  exportPdfLoading: boolean;
  onExportPdf: () => void;
  onShareResults: () => void;
  onRetakeAssessment: () => void;
  assessmentId: string;
}

export const ResultsHeader = ({
  title,
  createdAt,
  level,
  userTier,
  exportPdfLoading,
  onExportPdf,
  onShareResults,
  onRetakeAssessment,
  assessmentId
}: ResultsHeaderProps) => {
  const navigate = useNavigate();

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <motion.div 
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="outline" 
            onClick={() => navigate("/skill-assessments")}
            className="mb-4"
            aria-label="Back to assessments"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Button>
        </motion.div>
      </motion.div>

      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
        variants={item}
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold">{title} Results</h1>
          <p className="text-muted-foreground">
            Completed on {new Date(createdAt).toLocaleDateString()}
            {level && ` • ${level.charAt(0).toUpperCase() + level.slice(1)} level`}
          </p>
        </motion.div>
        
        <motion.div 
          className="flex gap-2 flex-wrap w-full md:w-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full sm:w-auto">
                  <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onExportPdf}
                      disabled={userTier === 'free' || exportPdfLoading}
                      className="relative w-full sm:w-auto"
                    >
                      {exportPdfLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export PDF
                      {userTier === 'free' && (
                        <Lock className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </motion.div>
                </div>
              </TooltipTrigger>
              {userTier === 'free' && (
                <TooltipContent>
                  <p>Upgrade to Pro or Premium to export results</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
          <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShareResults}
              className="w-full sm:w-auto"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </motion.div>
          
          <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
            <Button
              size="sm"
              onClick={onRetakeAssessment}
              className="w-full sm:w-auto"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Retake Assessment
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
