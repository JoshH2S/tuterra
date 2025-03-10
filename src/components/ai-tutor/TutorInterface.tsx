
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
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
  const [showSidebar, setShowSidebar] = useState(false);
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [smartNotes, setSmartNotes] = useState<string[]>([]);
  const [learningSteps, setLearningSteps] = useState<LearningStep[]>(DEFAULT_LEARNING_STEPS);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [showNotesPanel, setShowNotesPanel] = useState(false);

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

  // Toggle notes panel visibility
  const toggleNotesPanel = () => {
    setShowNotesPanel(prev => !prev);
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
    <div className="h-full w-full overflow-hidden flex flex-col">
      <TutorHeader 
        activeStep={activeStep}
        totalSteps={learningSteps.length}
        title={currentTopic || "AI Study Assistant"}
        toggleSidebar={toggleSidebar}
        showSidebarToggle={true}
      >
        <SubscriptionBadge tier={subscription.tier} />
      </TutorHeader>

      <div className="flex-1 relative overflow-hidden">
        {/* Main chat area */}
        <div className="h-full">
          <TutorChat 
            onSendMessage={handleSendMessage} 
            subscription={subscription}
            smartNotes={smartNotes}
            setSmartNotes={setSmartNotes}
          />
        </div>

        {/* Learning path sidebar using Sheet component for mobile */}
        {isMobile ? (
          <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
            <SheetContent side="left" className="p-0 w-[85%] sm:max-w-md">
              <LearningPathPanel 
                activeStep={activeStep} 
                setActiveStep={handleStepClick}
                subscriptionTier={subscription.tier}
                steps={learningSteps}
                onClose={() => setShowSidebar(false)}
              />
            </SheetContent>
          </Sheet>
        ) : (
          <AnimatePresence>
            {showSidebar && (
              <motion.div 
                className="absolute top-0 left-0 h-full w-64 border-r bg-background z-10"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
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
        )}

        {/* Smart Notes Panel for premium users - show as Sheet on mobile */}
        {subscription.tier === 'premium' && (
          <>
            {isMobile ? (
              <Sheet open={showNotesPanel} onOpenChange={setShowNotesPanel}>
                <SheetContent side="right" className="p-0 w-[85%] sm:max-w-md">
                  <SmartNotesPanel notes={smartNotes} />
                </SheetContent>
              </Sheet>
            ) : (
              <AnimatePresence>
                {showNotesPanel && (
                  <motion.div 
                    className="absolute top-0 right-0 h-full w-64 border-l bg-background z-10"
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <SmartNotesPanel notes={smartNotes} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </>
        )}
      </div>
    </div>
  );
};
