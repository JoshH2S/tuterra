import { motion } from "framer-motion";
export function DashboardPreview() {
  return <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }}>
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">
              Powerful Dashboard for Enhanced Learning
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Track your progress, manage assignments, and stay organized with our
              intuitive dashboard. Get real-time insights into your learning journey
              and make data-driven decisions to improve your performance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          <motion.div initial={{
          opacity: 0,
          x: 20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8
        }} className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl transform rotate-2 opacity-70 dark:opacity-50 -z-10" />
            <img alt="Dashboard Preview" className="relative rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full h-auto" src="/lovable-uploads/d88b3ac6-4f44-4e30-b4d8-32d7190ea211.png" />
          </motion.div>
        </div>
      </div>
    </section>;
}