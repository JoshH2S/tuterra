
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { PricingSection } from "@/components/pricing/PricingSection";

export default function LandingPagePricing() {
  return (
    <Layout isLandingPage>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-white"
      >
        <PricingSection />
      </motion.div>
    </Layout>
  );
}
