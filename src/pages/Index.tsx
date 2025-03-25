
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
  const { isOnline } = useNetworkStatus();
  const isMobile = useIsMobile();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-white dark:from-gray-950 dark:to-gray-900 -m-4 md:-m-8">
      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 z-10">
          <motion.img 
            src="/lovable-uploads/0b906dbe-8ddf-4736-8e1f-ef3ad2bf047b.png" 
            alt="Logo" 
            className="w-24 h-24 md:w-32 md:h-32 object-contain"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <HeroSection 
          title="Learn, Adapt, Succeed"
          subtitle={{
            regular: "Transform your learning with ",
            gradient: "AI-powered education",
          }}
          description="Experience a revolutionary approach to learning with our AI-enhanced educational platform. Join us and unlock your full potential."
          ctaText={
            <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row gap-4'}`}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/courses"
                  className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-blue-300/20 via-blue-500/30 to-transparent dark:from-blue-300/5 dark:via-blue-500/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-blue-300/30 hover:via-blue-500/40 hover:to-transparent dark:hover:from-blue-300/10 dark:hover:via-blue-500/30 transition-all py-3 px-6 w-full md:py-4 md:px-10"
                >
                  Get Started
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/tutor"
                  className="inline-flex rounded-full text-center group items-center justify-center bg-gradient-to-tr from-blue-300/20 via-blue-500/30 to-transparent dark:from-blue-300/5 dark:via-blue-500/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-blue-300/30 hover:via-blue-500/40 hover:to-transparent dark:hover:from-blue-300/10 dark:hover:via-blue-500/30 transition-all py-3 px-6 w-full md:py-4 md:px-10"
                >
                  Try AI Tutor
                </Link>
              </motion.div>
            </div>
          }
          gridOptions={{
            angle: 65,
            opacity: 0.3,
            cellSize: isMobile ? 30 : 50,
            lightLineColor: "#4a4a4a",
            darkLineColor: "#2a2a2a",
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="absolute inset-0 bg-gradient-to-tr from-blue-300/20 via-blue-500/10 to-transparent dark:from-blue-300/5 dark:via-blue-500/10 rounded-3xl backdrop-blur-sm"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.7 } }
            }}
          />
          
          <div className="relative">
            <div className="text-center mb-10 md:mb-16">
              <div className="flex items-center justify-center gap-2">
                <TextShimmer 
                  as="h2"
                  className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-3"
                >
                  Featured Benefits
                </TextShimmer>
                
                <InteractiveTooltip
                  trigger={
                    <button aria-label="More information" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                      <Info className="h-5 w-5" />
                    </button>
                  }
                  content={
                    <div className="max-w-[200px] p-1">
                      <p>Discover how our platform enhances your learning journey with AI-powered tools and personalized experiences.</p>
                    </div>
                  }
                />
              </div>
              <p className="mt-4 text-base md:text-lg leading-8 text-gray-600 dark:text-gray-300">
                Discover how our platform can transform your learning experience
              </p>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={itemVariants}>
                <Card className="p-6 border-none bg-gradient-to-tr from-blue-300/20 via-blue-500/10 to-transparent dark:from-blue-300/5 dark:via-blue-500/10 h-full">
                  <div className="flex flex-col items-start gap-4 h-full">
                    <div className="rounded-lg bg-primary-100/10 dark:bg-primary-100/5 p-3">
                      <Brain className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Intelligent Assessment</h3>
                      <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
                        AI-powered analysis of your learning patterns to provide personalized feedback and recommendations.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-6 border-none bg-gradient-to-tr from-blue-300/20 via-blue-500/10 to-transparent dark:from-blue-300/5 dark:via-blue-500/10 h-full">
                  <div className="flex flex-col items-start gap-4 h-full">
                    <div className="rounded-lg bg-primary-100/10 dark:bg-primary-100/5 p-3">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Collaborative Learning</h3>
                      <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
                        Connect with peers and experts in real-time discussion forums and group study sessions.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-6 border-none bg-gradient-to-tr from-blue-300/20 via-blue-500/10 to-transparent dark:from-blue-300/5 dark:via-blue-500/10 h-full">
                  <div className="flex flex-col items-start gap-4 h-full">
                    <div className="rounded-lg bg-primary-100/10 dark:bg-primary-100/5 p-3">
                      <Bot className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">AI Tutoring</h3>
                      <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
                        24/7 access to AI tutors that adapt to your learning style and pace.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-center z-50 shadow-lg">
          You are currently offline. Some features may be limited.
        </div>
      )}
    </div>
  );
};

export default Index;
