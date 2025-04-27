"use client";

import * as React from "react";
import { motion, useMotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";

export interface Feature {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink?: string;
}

interface FeatureShowcaseProps {
  features: Feature[];
}

export function FeatureShowcase({ features }: FeatureShowcaseProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const x = useMotionValue(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { isMobile } = useResponsive();

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(features.length - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < features.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleDragStart = () => setDragging(true);
  
  const handleDragEnd = (e: any, { offset }: { offset: { x: number } }) => {
    setDragging(false);
    
    if (Math.abs(offset.x) > 100) {
      if (offset.x > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container px-4 mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">
            Powerful Features for Enhanced Learning
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Our platform provides a suite of integrated tools to supercharge your learning experience
          </p>
        </motion.div>

        <div className="relative">
          <div
            ref={containerRef}
            className="w-full overflow-hidden relative"
          >
            <motion.div
              drag={isMobile ? "x" : false}
              dragElastic={0.1}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              style={{ x }}
              animate={{ x: -currentIndex * 100 + "%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="flex w-full h-full touch-pan-y"
            >
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index} 
                  feature={feature} 
                  isActive={currentIndex === index} 
                />
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center items-center mt-8 space-x-4">
            <Button
              onClick={handlePrev}
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Previous feature"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    currentIndex === index
                      ? "bg-primary w-6"
                      : "bg-gray-300 dark:bg-gray-700"
                  )}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>
            
            <Button
              onClick={handleNext}
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Next feature"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  feature: Feature;
  isActive: boolean;
}

function FeatureCard({ feature, isActive }: FeatureCardProps) {
  const { isMobile } = useResponsive();
  
  return (
    <motion.div
      className="w-full flex-shrink-0 flex flex-col md:flex-row items-center gap-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="w-full md:w-1/2 relative overflow-hidden rounded-xl shadow-xl"
        initial={{ scale: 0.95 }}
        animate={{ 
          scale: isActive ? 1 : 0.95,
          y: isActive ? 0 : 10
        }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={feature.image}
          alt={feature.title}
          className="w-full h-auto object-cover rounded-xl"
          style={{ aspectRatio: "16/9" }}
        />
        
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-400/10 rounded-full blur-xl" />
      </motion.div>
      
      <motion.div 
        className="w-full md:w-1/2 text-left p-4"
        initial={{ x: 20 }}
        animate={{ x: isActive ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className={`${isMobile ? 'text-center' : 'text-left'} space-y-4`}>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {feature.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {feature.description}
          </p>
          <div className={`${isMobile ? 'flex justify-center' : ''} pt-4`}>
            <Button asChild size="lg" className="rounded-full font-medium">
              <Link to={feature.buttonLink || "/auth"}>
                {feature.buttonText}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
