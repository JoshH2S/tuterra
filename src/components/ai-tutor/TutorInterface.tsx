
import { useState, useEffect } from "react";
import { LearningPathPanel } from "./LearningPathPanel";
import { TutorChat } from "@/components/tutor/TutorChat";
import { TutorHeader } from "./TutorHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionBadge } from "./SubscriptionBadge";
import { supabase } from "@/integrations/supabase/client";

interface TutorInterfaceProps {
  onConversationStart?: () => void;
}

export const TutorInterface = ({ onConversationStart }: TutorInterfaceProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const { user } = useAuth();
  const [subscriptionTier, setSubscriptionTier] = useState<"free" | "pro" | "premium">("free");

  // Fetch user subscription tier from profiles table
  useEffect(() => {
    const fetchSubscriptionTier = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          setSubscriptionTier(data.subscription_tier as "free" | "pro" | "premium");
        }
      } catch (error) {
        console.error("Error fetching subscription tier:", error);
      }
    };

    fetchSubscriptionTier();
  }, [user]);

  const handleSendMessage = () => {
    if (onConversationStart) {
      onConversationStart();
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <TutorHeader 
        activeStep={activeStep}
        totalSteps={5}
        title="AI Study Assistant"
        toggleSidebar={toggleSidebar}
        showSidebarToggle={isMobile}
      >
        <SubscriptionBadge tier={subscriptionTier} />
      </TutorHeader>

      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* Learning path sidebar - conditionally shown on mobile */}
        {showSidebar && (
          <motion.div 
            className={`${isMobile ? 'absolute z-10 h-[calc(100%-4rem)] w-[80%] shadow-xl' : 'w-64 border-r'} bg-background`}
            initial={{ x: isMobile ? -280 : 0 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LearningPathPanel 
              activeStep={activeStep} 
              setActiveStep={setActiveStep}
              subscriptionTier={subscriptionTier}
              onClose={isMobile ? () => setShowSidebar(false) : undefined}
            />
          </motion.div>
        )}

        {/* Main chat area */}
        <div className="flex-grow">
          <TutorChat onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};
