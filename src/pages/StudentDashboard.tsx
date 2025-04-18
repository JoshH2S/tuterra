import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MobileDashboard } from "@/components/dashboard/MobileDashboard";
import { DesktopDashboard } from "@/components/dashboard/DesktopDashboard";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { useAuth } from "@/hooks/useAuth";

export default function StudentDashboard() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user } = useAuth();
  const firstName = user?.user_metadata?.first_name || "Student";
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
        {/* Add the welcome banner here */}
        <WelcomeBanner userName={firstName} />
        
        {/* Rest of the dashboard content */}
        {isMobile ? <MobileDashboard /> : <DesktopDashboard />}
      </div>
    </div>
  );
}
