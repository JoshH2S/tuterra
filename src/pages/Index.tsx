
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { FloatingCards } from "@/components/landing/FloatingCards";
import { FeatureShowcaseDemo } from "@/components/landing/FeatureShowcaseDemo";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { useNetworkStatus } from "@/hooks/interview/useNetworkStatus";

const Index = () => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="min-h-screen bg-white -m-4 md:-m-8 w-full max-w-full overflow-hidden">
      <HeroSection />
      <FeatureShowcaseDemo />
      <FeaturesSection />
      <FloatingCards />
      <ComparisonSection />
      <CtaSection />
      
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-center z-50 shadow-lg">
          You are currently offline. Some features may be limited.
        </div>
      )}
    </div>
  );
};

export default Index;
