
import { useState, useEffect } from "react";
import { LearningPathPanel } from "./LearningPathPanel";
import { TutorChat } from "@/components/tutor/TutorChat";
import { TutorHeader } from "./TutorHeader";
import { useIsMobile, useTouchDevice } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionBadge } from "./SubscriptionBadge";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { SmartNotesPanel } from "./SmartNotesPanel";
import { Card } from "@/components/ui/card";

interface TutorInterfaceProps {
  onConversationStart?: () => void;
}

// Define Step type for type safety
interface LearningStep {
  title: string;
  completed: boolean;
}

const DEFAULT_LEARNING_STEPS: LearningStep[] = [
  { title: "Understand key concepts", completed: false },
  { title: "Practice with examples", completed: false },
  { title: "Apply knowledge", completed: false },
  { title: "Review and reinforce", completed: false },
  { title: "Test your understanding", completed: false },
];

export const TutorInterface = ({ onConversationStart }: TutorInterfaceProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const isMobile = useIsMobile();
  const isTouch = useTouchDevice();
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [smartNotes, setSmartNotes] = useState<string[]>([]);
  const [learningSteps, setLearningSteps] = useState<LearningStep[]>(DEFAULT_LEARNING_STEPS);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  // Handle send message and conversation start
  const handleSendMessage = () => {
    if (onConversationStart) {
      onConversationStart();
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  // Fetch conversation data if available
  useEffect(() => {
    const fetchConversationData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("tutor_conversations")
          .select("topic, progress, learning_path, smart_notes")
          .eq("student_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          // Handle topic
          if (data.topic) setCurrentTopic(data.topic);
          
          // Handle progress
          if (data.progress !== null && typeof data.progress === 'number') {
            setActiveStep(data.progress);
          }
          
          // Handle learning_path - ensure it's an array before setting state
          if (data.learning_path && Array.isArray(data.learning_path) && data.learning_path.length > 0) {
            setLearningSteps(data.learning_path as LearningStep[]);
          }
          
          // Handle smart_notes - ensure it's an array before setting state
          if (data.smart_notes && Array.isArray(data.smart_notes) && data.smart_notes.length > 0) {
            setSmartNotes(data.smart_notes as string[]);
          }
        }
      } catch (error) {
        console.error("Error fetching conversation data:", error);
      }
    };

    fetchConversationData();
  }, [user]);

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <TutorHeader 
        activeStep={activeStep}
        totalSteps={learningSteps.length}
        title={currentTopic || "AI Study Assistant"}
        toggleSidebar={toggleSidebar}
        showSidebarToggle={isMobile}
      >
        <SubscriptionBadge tier={subscription.tier} />
      </TutorHeader>

      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* Learning path sidebar - conditionally shown based on mobile and subscription */}
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
              subscriptionTier={subscription.tier}
              steps={learningSteps}
              onClose={isMobile ? () => setShowSidebar(false) : undefined}
            />
          </motion.div>
        )}

        {/* Main content area with responsive layout for subscription tiers */}
        <div className={`flex-grow grid grid-cols-12 gap-0 md:gap-4 p-0 md:p-4`}>
          {/* Larger chat area for free tier, smaller for paid tiers */}
          <div className={`${subscription.tier === 'free' ? 'col-span-12' : 'col-span-12 lg:col-span-8'}`}>
            <TutorChat 
              onSendMessage={handleSendMessage} 
              subscription={subscription}
              smartNotes={smartNotes}
              setSmartNotes={setSmartNotes}
            />
          </div>

          {/* Smart Notes Panel - only for premium tier */}
          {subscription.tier === 'premium' && (
            <div className="hidden lg:block lg:col-span-4">
              <SmartNotesPanel notes={smartNotes} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
