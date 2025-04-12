
import { motion } from "framer-motion";
import { Carousel } from "@/components/ui/carousel";

export function DashboardPreview() {
  const slideData = [
    {
      title: "Interactive Learning Dashboard",
      button: "Explore Features",
      src: "/lovable-uploads/d88b3ac6-4f44-4e30-b4d8-32d7190ea211.png",
    },
    {
      title: "Progress Tracking",
      button: "See Analytics",
      src: "/lovable-uploads/9c384236-998d-4be7-8fce-38625409b005.png",
    },
    {
      title: "AI Study Assistant",
      button: "Try It Now",
      src: "/lovable-uploads/ab68bba9-f2b9-4344-9799-6209be49e097.png",
    },
    {
      title: "Personalized Learning",
      button: "Get Started",
      src: "/lovable-uploads/5abc5bdf-f0f2-4773-844c-b174f2e2b884.png",
    },
  ];
  
  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid gap-12">
          <motion.div 
            initial={{
              opacity: 0,
              x: -20
            }} 
            whileInView={{
              opacity: 1,
              x: 0
            }} 
            viewport={{
              once: true
            }} 
            transition={{
              duration: 0.8
            }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">
              Powerful Dashboard for Enhanced Learning
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Track your progress, manage assignments, and stay organized with our
              intuitive dashboard. Get real-time insights into your learning journey
              and make data-driven decisions to improve your performance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-1 text-gray-700 dark:text-gray-300">Course Completion</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">92%</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-1 text-gray-700 dark:text-gray-300">Active Courses</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">15</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.8
            }}
            className="w-full"
          >
            <div className="relative overflow-hidden w-full py-10">
              <Carousel slides={slideData} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
