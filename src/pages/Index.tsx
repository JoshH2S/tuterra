
import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureShowcaseDemo } from "@/components/landing/FeatureShowcaseDemo";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { useNetworkStatus } from "@/hooks/interview/useNetworkStatus";
import { EnhancedNavigation } from "@/components/navigation/EnhancedNavigation";
import { Header1 } from "@/components/ui/header";

const Index = () => {
  const { isOnline } = useNetworkStatus();
  
  const sections = [
    { id: "hero", label: "Home" },
    { id: "features", label: "Features" },
    { id: "comparison", label: "Why Choose Us" },
    { id: "pricing", label: "Pricing" },
    { id: "cta", label: "Get Started" }
  ];

  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-hidden">
      <Header1 />
      
      <div className="pt-20">
        <section id="hero" className="min-h-screen">
          <HeroSection />
        </section>
        
        <section id="features" className="min-h-screen">
          <FeatureShowcaseDemo />
        </section>
        
        <section id="comparison" className="min-h-screen">
          <ComparisonSection />
        </section>

        <section id="pricing" className="min-h-screen">
          <PricingSection />
        </section>
        
        <section id="cta" className="min-h-screen">
          <CtaSection />
        </section>
      </div>
      
      <EnhancedNavigation sections={sections} />
      
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-center z-50 shadow-lg">
          You are currently offline. Some features may be limited.
        </div>
      )}
    </div>
  );
};

export default Index;
