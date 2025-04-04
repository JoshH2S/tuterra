
import { motion } from "framer-motion";

export function DashboardPreview() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">
            Powerful Dashboard at Your Fingertips
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access all your educational resources and analytics in one intuitive interface.
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="bg-gray-800 p-2 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="mx-auto text-white text-sm">tuterra.ai Dashboard</div>
            </div>
            <img 
              src="/lovable-uploads/ab68bba9-f2b9-4344-9799-6209be49e097.png" 
              alt="Dashboard Preview" 
              className="w-full h-auto"
            />
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl -z-10" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl -z-10" />
        </div>
      </div>
    </section>
  );
}
