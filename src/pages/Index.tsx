
import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureShowcaseDemo } from "@/components/landing/FeatureShowcaseDemo";
import { PricingSection } from "@/components/landing/PricingSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { useNetworkStatus } from "@/hooks/interview/useNetworkStatus";
import { EnhancedNavigation } from "@/components/navigation/EnhancedNavigation";
import { Header1 } from "@/components/ui/header";

const sections = [
  { id: "hero", label: "Home" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "cta", label: "Get Started" }
];

const Index = () => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-hidden">
      <Header1 />

      <div>
        <section id="hero">
          <HeroSection />
        </section>

        <section id="features" className="scroll-mt-20">
          <FeatureShowcaseDemo />
        </section>

        <section id="pricing" className="scroll-mt-20">
          <PricingSection />
        </section>

        <section id="cta" className="scroll-mt-20">
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