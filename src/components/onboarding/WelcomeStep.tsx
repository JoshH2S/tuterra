
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, Target, ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  onStart: () => void;
}

export const WelcomeStep = ({ onStart }: WelcomeStepProps) => {
  const steps = [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Create Profile",
      description: "Set up your personalized learning profile"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Education Level",
      description: "Tell us about your academic background"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Learning Goals",
      description: "Choose topics that interest you"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-6"
    >
      <div className="max-w-2xl w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <img 
            src="/lovable-uploads/ab68bba9-f2b9-4344-9799-6209be49e097.png"
            alt="Tuterra Logo"
            className="h-12 mx-auto"
          />
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Welcome to Tuterra
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Let's personalize your learning journey in just a few steps
          </p>
        </motion.div>

        <div className="grid gap-6 mt-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {step.icon}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <Button
            onClick={onStart}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 group touch-manipulation"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
