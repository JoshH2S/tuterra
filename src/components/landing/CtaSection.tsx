import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-[#F9F7F0] py-28">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="text-xs font-mono uppercase tracking-widest text-[#C8A84B] mb-6">
            Get Started
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-[#091747] leading-tight">
            Ready to Learn With Purpose?
          </h2>
          <p className="mt-5 text-base text-stone-500 leading-relaxed">
            Join Tuterra and start building the skills that matter.
          </p>
          <div className="mt-10">
            <Link to="/auth?tab=signup">
              <Button className="rounded-full px-10 py-3 h-auto bg-[#091747] text-white hover:bg-[#0d2060] transition-colors duration-150 text-base font-medium flex items-center gap-2 mx-auto">
                Start Your Learning Journey
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
