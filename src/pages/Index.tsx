
import { HeroSection } from "@/components/landing/HeroSection";
import { FloatingCards } from "@/components/landing/FloatingCards";
import { FeatureShowcaseDemo } from "@/components/landing/FeatureShowcaseDemo";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { useNetworkStatus } from "@/hooks/interview/useNetworkStatus";
import { EnhancedNavigation } from "@/components/navigation/EnhancedNavigation";
import { Header1 } from "@/components/ui/header";

const Index = () => {
  const { isOnline } = useNetworkStatus();
  
  // Define sections for the navigation
  const sections = [
    { id: "hero", title: "Home" },
    // Removed Features section from navigation
    { id: "comparison", title: "Why Choose Us" },
    { id: "cta", title: "Get Started" }
  ];

  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-hidden">
      <Header1 />
      
      <div className="pt-20">
        <section id="hero">
          <HeroSection />
        </section>
        
        <section id="features">
          <FeatureShowcaseDemo />
        </section>
        
        {/* Removed FeaturesSection component */}
        <FloatingCards />
        
        <section id="comparison">
          <ComparisonSection />
        </section>
        
        <section id="cta">
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
