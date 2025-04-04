
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-100/80 to-primary-200/80 text-white shadow-md">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:to-blue-500">
            Ready to Transform Your Educational Experience?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of educators and students already using our platform to enhance learning outcomes.
          </p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="inline-block"
          >
            <Link 
              to="/courses" 
              className="px-10 py-4 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Get Started Today
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
