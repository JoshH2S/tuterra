
import { motion } from "framer-motion";
import { CustomCarousel } from "@/components/ui/custom-carousel";

export function DashboardPreview() {
  const slideData = [
    {
      title: "Skill Assessment Experience",
      button: "Explore Features",
      src: "/lovable-uploads/089c8cb1-63b0-4ed5-ba8c-419af66cdf7e.png",
    },
    {
      title: "Interactive Dashboard",
      button: "View Analytics",
      src: "/lovable-uploads/66e5de1b-be24-4178-944a-09183d99629d.png",
    },
    {
      title: "Interview Simulator",
      button: "Practice Now",
      src: "/lovable-uploads/3df6641b-fd5a-4272-9c39-6ee0258337db.png",
    },
    {
      title: "Interactive Learning Experience",
      button: "Start Learning",
      src: "/lovable-uploads/a02bdab0-bfea-438f-9680-b4e948ed841a.png",
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

          {/* Carousel section in a separate row */}
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
              <CustomCarousel slides={slideData} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
