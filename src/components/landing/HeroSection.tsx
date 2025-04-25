
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative px-4 py-16 md:py-24 lg:py-32 overflow-hidden bg-white">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div>
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
              >
                Learn Faster With <span className="text-gradient-blue">AI-Powered</span> Education
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-lg text-muted-foreground mb-8"
              >
                Generate quizzes, get personalized tutoring, and prepare for interviews with our advanced AI learning platform.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button className="px-8 btn-gold-gradient group" size="lg" asChild>
                <Link to="/auth?tab=signup">
                  Get Started <MoveRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" asChild>
                <Link to="/landing-pricing">
                  See Pricing
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative"
          >
            <div className="bg-gradient-to-tr from-primary-100 via-primary-200/50 to-transparent p-4 rounded-2xl shadow-lg">
              <img 
                src="/lovable-uploads/089c8cb1-63b0-4ed5-ba8c-419af66cdf7e.png" 
                alt="AI Education Platform" 
                className="w-full h-auto rounded-xl shadow-md"
              />
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-3 max-w-[180px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 bg-primary-300 rounded-full"></div>
                <p className="text-sm font-medium">Daily Progress</p>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-primary-300 to-primary-400"></div>
              </div>
              <p className="text-xs text-right mt-1 text-muted-foreground">75% Complete</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
