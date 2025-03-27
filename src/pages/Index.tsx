import { Link } from "react-router-dom";
import { BookOpen, Brain, Bot, Users, Sparkles, Info } from "lucide-react";
import { HeroSection } from "@/components/blocks/hero-section-dark";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNetworkStatus } from "@/hooks/interview/useNetworkStatus";
import { useIsMobile } from "@/hooks/use-mobile";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";
const Index = () => {
  const {
    isOnline
  } = useNetworkStatus();
  const isMobile = useIsMobile();
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white dark:from-gray-950 dark:to-gray-900 -m-4 md:-m-8">
      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 z-10">
          <motion.img alt="Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} src="/lovable-uploads/bb3ce32a-05c1-4a4f-bd76-94c59d8c1699.png" />
        </div>
        
        <HeroSection title="Learn, Adapt, Succeed" subtitle={{
        regular: "Transform your learning with ",
        gradient: "AI-powered education"
      }} description="Experience a revolutionary approach to learning with our AI-enhanced educational platform. Join us and unlock your full potential." ctaText={<div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row gap-4'}`}>
              <motion.div whileHover={{
          scale: 1.03
        }} whileTap={{
          scale: 0.97
        }}>
                <Link to="/courses" className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-blue-300/20 via-blue-500/30 to-transparent dark:from-blue-300/5 dark:via-blue-500/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-blue-300/30 hover:via-blue-500/40 hover:to-transparent dark:hover:from-blue-300/10 dark:hover:via-blue-500/30 transition-all py-3 px-6 w-full md:py-4 md:px-10">
                  Get Started
                </Link>
              </motion.div>
              <motion.div whileHover={{
          scale: 1.03
        }} whileTap={{
          scale: 0.97
        }}>
                <Link to="/tutor" className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-blue-300/20 via-blue-500/30 to-transparent dark:from-blue-300/5 dark:via-blue-500/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-blue-300/30 hover:via-blue-500/40 hover:to-transparent dark:hover:from-blue-300/10 dark:hover:via-blue-500/30 transition-all py-3 px-6 w-full md:py-4 md:px-10">
                  Try AI Tutor
                </Link>
              </motion.div>
            </div>} gridOptions={{
        angle: 65,
        opacity: 0.3,
        cellSize: isMobile ? 30 : 50,
        lightLineColor: "#4a4a4a",
        darkLineColor: "#2a2a2a"
      }} />
      </div>
      
      {!isOnline && <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-center z-50 shadow-lg">
          You are currently offline. Some features may be limited.
        </div>}
    </div>;
};
export default Index;