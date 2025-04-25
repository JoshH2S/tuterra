
import React from "react";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const CtaSection = () => {
  return (
    <section id="cta" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-primary-100/80 to-primary-200/80 rounded-2xl p-8 md:p-12 shadow-lg text-center"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Ready to transform your learning experience?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students and educators who are already using our platform to enhance their learning journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="px-8 bg-primary text-white group" size="lg" asChild>
              <Link to="/auth?tab=signup">
                Get Started <MoveRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" className="bg-white/30" size="lg" asChild>
              <Link to="/landing-pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
