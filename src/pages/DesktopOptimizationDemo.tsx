
import React from "react";
import { AdvancedCharts } from "@/components/desktop/AdvancedCharts";
import { DesktopNavigation } from "@/components/desktop/EnhancedNavigation";
import { DesktopCard, DesktopFeatureCard, DesktopStatsCard } from "@/components/desktop/HoverCards";
import { AdaptiveChart, AdaptiveSubjectChart } from "@/components/shared/AdaptiveChart";
import { ResponsiveCard, FeatureCard } from "@/components/shared/ResponsiveCard";
import { 
  AdaptiveLoading, 
  LoadingCard, 
  LoadingChart 
} from "@/components/shared/LoadingStates";
import { useResponsive } from "@/hooks/useResponsive";
import { BarChart, LineChart, PieChart, Activity, Award, BookOpen, Code } from "lucide-react";

export default function DesktopOptimizationDemo() {
  const { isDesktop, isMobile, isTablet } = useResponsive();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <section id="hero" className="py-12">
        <h1 className="text-3xl lg:text-4xl font-bold mb-6">
          Desktop & Mobile Optimized Components
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          This page demonstrates components that are optimized for both desktop and mobile experiences.
          You are currently on a{" "}
          <span className="font-semibold">
            {isDesktop ? "desktop" : isTablet ? "tablet" : "mobile"}
          </span>{" "}
          device.
        </p>
        
        {/* Device-specific message */}
        {isDesktop ? (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-8">
            <p className="text-blue-800 dark:text-blue-200">
              You're viewing the desktop experience with enhanced interactions, hover effects, and detailed visualizations.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-8">
            <p className="text-amber-800 dark:text-amber-200">
              You're viewing the mobile experience with touch-optimized controls and simplified layouts.
            </p>
          </div>
        )}
      </section>

      <section id="features" className="py-12">
        <h2 className="text-2xl lg:text-3xl font-bold mb-8">Responsive Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BarChart className="h-6 w-6" />}
            title="Adaptive Charts"
            description="Charts that automatically adapt to the user's device for optimal viewing experience."
          />
          <FeatureCard
            icon={<BookOpen className="h-6 w-6" />}
            title="Responsive Content"
            description="Content layouts that adjust fluidly between mobile and desktop views."
          />
          <FeatureCard
            icon={<Code className="h-6 w-6" />}
            title="Device Detection"
            description="Intelligent device detection to provide the best possible user experience."
          />
        </div>
        
        {isDesktop && (
          <>
            <h2 className="text-2xl lg:text-3xl font-bold mt-12 mb-8">Desktop Cards with Hover</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DesktopFeatureCard
                icon={<LineChart className="h-6 w-6" />}
                title="Interactive Hover"
                description="Desktop-specific hover interactions that enhance the user experience."
              />
              <DesktopFeatureCard
                icon={<PieChart className="h-6 w-6" />}
                title="Advanced Visualizations"
                description="Detailed chart visualizations optimized for larger screens."
              />
              <DesktopFeatureCard
                icon={<Activity className="h-6 w-6" />}
                title="Performance Tracking"
                description="Detailed analytics dashboards for desktop users."
              />
            </div>
          </>
        )}
      </section>

      <section id="charts" className="py-12">
        <h2 className="text-2xl lg:text-3xl font-bold mb-8">Adaptive Charts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AdaptiveChart />
          <AdaptiveSubjectChart />
        </div>
        
        {isDesktop && (
          <>
            <h2 className="text-2xl lg:text-3xl font-bold mb-8 mt-12">Desktop-Only Advanced Charts</h2>
            <AdvancedCharts />
          </>
        )}
      </section>

      <section id="loading" className="py-12">
        <h2 className="text-2xl lg:text-3xl font-bold mb-8">Loading States</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingCard />
          <LoadingChart />
        </div>
      </section>

      {/* Desktop Navigation is automatically rendered only on desktop */}
      <DesktopNavigation />
    </div>
  );
}
