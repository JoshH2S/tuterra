
import { useState, useEffect } from "react";
import { LearningPathPanel } from "./LearningPathPanel";
import { TutorChat } from "@/components/tutor/TutorChat";
import { TutorHeader } from "./TutorHeader";
import { useIsMobile, useTouchDevice } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { SubscriptionBadge } from "./SubscriptionBadge";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { SmartNotesPanel } from "./SmartNotesPanel";
import { LayoutPanelLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Always start with sidebar collapsed
  const [showSidebar, setShowSidebar] = useState(false);
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

  // Close sidebar when clicking a step on mobile
  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
    if (isMobile) {
      setShowSidebar(false);
    }
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
          if (data.learning_path && Array.isArray(data.learning_path)) {
            // Parse each item and ensure it has the proper structure
            const validSteps = data.learning_path
              .filter((step): step is {title: string, completed: boolean} => 
                typeof step === 'object' && 
                step !== null && 
                'title' in step && 
                'completed' in step &&
                typeof step.title === 'string' &&
                typeof step.completed === 'boolean'
              );
            
            if (validSteps.length > 0) {
              setLearningSteps(validSteps);
            }
          }
          
          // Handle smart_notes - ensure it's an array before setting state
          if (data.smart_notes && Array.isArray(data.smart_notes)) {
            // Ensure we only have strings in our smart notes array
            const validNotes = data.smart_notes
              .filter((note): note is string => typeof note === 'string');
            
            if (validNotes.length > 0) {
              setSmartNotes(validNotes);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching conversation data:", error);
      }
    };

    fetchConversationData();
  }, [user]);

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-background h-[calc(100dvh-2rem)] md:h-[calc(100dvh-4rem)]">
      <TutorHeader 
        activeStep={activeStep}
        totalSteps={learningSteps.length}
        title={currentTopic || "AI Study Assistant"}
        toggleSidebar={toggleSidebar}
        showSidebarToggle={false} // Hide the default toggle in header
      >
        <SubscriptionBadge tier={subscription.tier} />
      </TutorHeader>

      <div className="flex flex-col md:flex-row relative h-[calc(100dvh-8rem)] md:h-[calc(100dvh-8rem)]">
        {/* Toggle button for the sidebar - visible when sidebar is closed */}
        {!showSidebar && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute left-4 top-4 z-30"
          >
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 rounded-full p-0 flex items-center justify-center shadow-md border-border/80 bg-background/90 backdrop-blur-sm"
              onClick={toggleSidebar}
              aria-label="Open learning path"
            >
              <LayoutPanelLeft size={16} className="text-muted-foreground" />
            </Button>
          </motion.div>
        )}
        
        {/* Learning path sidebar with proper mobile layout */}
        <AnimatePresence mode="wait">
          {showSidebar && (
            <motion.div 
              className={`${isMobile ? 'absolute z-20 h-full w-[85%] shadow-xl' : 'md:w-64 border-r'} bg-background`}
              initial={{ x: isMobile ? '-100%' : 0, opacity: isMobile ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? '-100%' : 0, opacity: isMobile ? 0 : 1 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <LearningPathPanel 
                activeStep={activeStep} 
                setActiveStep={handleStepClick}
                subscriptionTier={subscription.tier}
                steps={learningSteps}
                onClose={() => setShowSidebar(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay to close sidebar on mobile */}
        {isMobile && showSidebar && (
          <motion.div 
            className="absolute inset-0 bg-black/40 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main content area with responsive layout for subscription tiers */}
        <div className="flex-grow grid grid-cols-12 gap-0 h-full overflow-hidden">
          {/* Larger chat area for free tier, smaller for paid tiers */}
          <div className={`${subscription.tier === 'free' ? 'col-span-12' : 'col-span-12 lg:col-span-8'} h-full`}>
            <TutorChat 
              onSendMessage={handleSendMessage} 
              subscription={subscription}
              smartNotes={smartNotes}
              setSmartNotes={setSmartNotes}
            />
          </div>

          {/* Smart Notes Panel - only for premium tier */}
          {subscription.tier === 'premium' && (
            <div className="hidden lg:block lg:col-span-4 h-full">
              <SmartNotesPanel notes={smartNotes} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
