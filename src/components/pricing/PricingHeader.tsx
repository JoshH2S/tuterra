
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumContentCard } from "@/components/ui/premium-card";

interface PricingHeaderProps {
  billingInterval: 'monthly' | 'yearly';
  setBillingInterval: (interval: 'monthly' | 'yearly') => void;
}

export function PricingHeader({ 
  billingInterval, 
  setBillingInterval 
}: PricingHeaderProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-3xl mx-auto text-center mb-12"
    >
      <h1 className="text-4xl font-bold tracking-tight mb-4">Choose the Right Plan</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Find the perfect plan for your learning journey
      </p>
      
      {billingInterval === 'monthly' && (
        <PremiumContentCard 
          title="Billing Options"
          variant="glass" 
          className="max-w-xs mx-auto p-2"
        >
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly" onClick={() => setBillingInterval('monthly')}>
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" onClick={() => setBillingInterval('yearly')}>
                Yearly <span className="ml-1 text-xs text-emerald-600">-20%</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </PremiumContentCard>
      )}
    </motion.div>
  );
}
