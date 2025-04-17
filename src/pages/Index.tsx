
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
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
    { id: "features", title: "Features" },
    { id: "comparison", title: "Why Choose Us" },
    { id: "cta", title: "Get Started" }
  ];

  return (
    <div className="min-h-screen bg-white w-full max-w-full overflow-hidden">
      {/* Add the new Header component at the top */}
      <Header1 />
      
      {/* Add padding-top to account for the fixed header */}
      <div className="pt-20">
        <section id="hero">
          <HeroSection />
        </section>
        
        <section id="features">
          <FeatureShowcaseDemo />
        </section>
        
        <FeaturesSection />
        <FloatingCards />
        
        <section id="comparison">
          <ComparisonSection />
        </section>
        
        <section id="cta">
          <CtaSection />
        </section>
      </div>
      
      {/* Enhanced navigation for better UX */}
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
