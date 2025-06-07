import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { AISupervisorService } from "@/services/aiSupervisor";
import { useToast } from "./use-toast";

interface UseAISupervisorProps {
  sessionId: string | null;
  enabled?: boolean;
}

interface SupervisorState {
  isInitialized: boolean;
  onboardingCompleted: boolean;
  lastCheckIn?: string;
  totalInteractions: number;
  supervisorName: string;
}

export function useAISupervisor({ sessionId, enabled = true }: UseAISupervisorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [supervisorState, setSupervisorState] = useState<SupervisorState | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize supervisor on component mount
  const initializeSupervisor = useCallback(async () => {
    if (!sessionId || sessionId === 'undefined' || !user?.id || user.id === 'undefined' || !enabled) {
      console.log('Skipping supervisor initialization:', { sessionId, userId: user?.id, enabled });
      return;
    }

    setLoading(true);
    try {
      const state = await AISupervisorService.initializeSupervisor(sessionId, user.id);
      setSupervisorState({
        isInitialized: true,
        onboardingCompleted: state.onboarding_completed,
        lastCheckIn: state.last_check_in_at,
        totalInteractions: state.total_interactions,
        supervisorName: state.supervisor_name
      });
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing supervisor:', error);
      if (enabled) {
        setError(error instanceof Error ? error.message : 'Failed to initialize supervisor');
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId, user, enabled]);

  // Trigger onboarding if needed
  const triggerOnboardingIfNeeded = useCallback(async () => {
    if (!sessionId || sessionId === 'undefined' || !user?.id || user.id === 'undefined' || !enabled || !supervisorState) {
      return;
    }

    // Only trigger if not already onboarded and we haven't already triggered
    if (!supervisorState.onboardingCompleted) {
      try {
        // Check if there's already an onboarding message to avoid duplicates
        const existingMessages = await AISupervisorService.getSupervisorMessages(sessionId, user.id);
        const hasOnboardingMessage = existingMessages.some(msg => msg.message_type === 'onboarding');
        
        if (hasOnboardingMessage) {
          console.log('Onboarding message already exists, skipping trigger');
          // Update local state to reflect completion
          setSupervisorState(prev => prev ? {
            ...prev,
            onboardingCompleted: true
          } : null);
          return;
        }
        
        console.log('Triggering onboarding for session:', sessionId);
        await AISupervisorService.triggerOnboarding(sessionId, user.id);
        
        // Show user notification
        toast({
          title: "Welcome Message",
          description: "Your supervisor has sent you a welcome message! Check the Messages tab.",
          duration: 5000,
        });

        // Update state
        setSupervisorState(prev => prev ? {
          ...prev,
          onboardingCompleted: true,
          totalInteractions: prev.totalInteractions + 1
        } : null);

        // Schedule team introductions after supervisor onboarding (only once)
        setTimeout(async () => {
          try {
            const shouldScheduleTeam = await AISupervisorService.shouldScheduleTeamIntroductions(sessionId, user.id);
            if (shouldScheduleTeam) {
              await AISupervisorService.scheduleTeamIntroductions(sessionId, user.id);
              toast({
                title: "Team introductions scheduled",
                description: "Your colleagues will be reaching out to introduce themselves!",
                duration: 4000,
              });
            }
          } catch (error) {
            console.error('Error scheduling team introductions:', error);
          }
        }, 2000);

      } catch (error) {
        console.error('Error triggering onboarding:', error);
      }
    }
  }, [sessionId, user, enabled, supervisorState, toast]);

  // Trigger check-in
  const triggerCheckIn = useCallback(async (taskId?: string) => {
    if (!sessionId || sessionId === 'undefined' || !user?.id || user.id === 'undefined' || !enabled) {
      return;
    }

    try {
      await AISupervisorService.triggerCheckIn(sessionId, user.id, taskId);
      
      toast({
        title: "Check-in Message",
        description: "Your supervisor has sent you a check-in message.",
        duration: 3000,
      });

      // Update state
      setSupervisorState(prev => prev ? {
        ...prev,
        lastCheckIn: new Date().toISOString(),
        totalInteractions: prev.totalInteractions + 1
      } : null);
    } catch (error) {
      console.error('Error triggering check-in:', error);
    }
  }, [sessionId, user, enabled, toast]);

  // Trigger feedback followup
  const triggerFeedbackFollowup = useCallback(async (submissionId: string, feedbackData: any) => {
    if (!sessionId || sessionId === 'undefined' || !user?.id || user.id === 'undefined' || !enabled) {
      return;
    }

    try {
      await AISupervisorService.triggerFeedbackFollowup(sessionId, user.id, submissionId, feedbackData);
      
      // Don't show immediate toast since it's scheduled
      console.log('Feedback followup scheduled');
    } catch (error) {
      console.error('Error triggering feedback followup:', error);
    }
  }, [sessionId, user, enabled]);

  // Analyze progress and suggest check-ins
  const analyzeProgressAndSuggestCheckIn = useCallback(async () => {
    if (!sessionId || sessionId === 'undefined' || !user?.id || user.id === 'undefined' || !enabled) {
      return;
    }

    try {
      const analysis = await AISupervisorService.analyzeProgressAndSuggestCheckIns(sessionId, user.id);
      
      if (analysis.shouldCheckIn) {
        console.log('Check-in suggested:', analysis.reason);
        await triggerCheckIn(analysis.taskId);
      }

      // Also analyze and schedule team interactions
      await AISupervisorService.analyzeAndScheduleTeamInteractions(sessionId, user.id);

      // Process any pending team messages
      await AISupervisorService.processTeamMessages();

    } catch (error) {
      console.error('Error analyzing progress:', error);
    }
  }, [sessionId, user, enabled, triggerCheckIn]);

  // Record user interaction
  const recordInteraction = useCallback(async (interactionType: string, context: any = {}) => {
    if (!sessionId || sessionId === 'undefined' || !user?.id || user.id === 'undefined' || !enabled) {
      return;
    }

    try {
      await AISupervisorService.recordInteraction(sessionId, user.id, interactionType, context);
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }, [sessionId, user, enabled]);

  // Initialize supervisor when dependencies change
  useEffect(() => {
    initializeSupervisor();
  }, [initializeSupervisor]);

  // Trigger onboarding after initialization
  useEffect(() => {
    if (supervisorState?.isInitialized) {
      // Delay onboarding trigger slightly to ensure UI is ready
      setTimeout(() => {
        triggerOnboardingIfNeeded();
      }, 1000);
    }
  }, [supervisorState?.isInitialized, triggerOnboardingIfNeeded]);

  // Auto-analyze progress periodically (every 5 minutes)
  useEffect(() => {
    if (!enabled || !supervisorState?.onboardingCompleted) return;

    const interval = setInterval(() => {
      analyzeProgressAndSuggestCheckIn();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [enabled, supervisorState?.onboardingCompleted, analyzeProgressAndSuggestCheckIn]);

  // Event handlers for common interactions
  const onTaskSubmitted = useCallback((submissionId: string, feedbackData?: any) => {
    recordInteraction('task_submitted', { submission_id: submissionId });
    
    if (feedbackData) {
      triggerFeedbackFollowup(submissionId, feedbackData);
    }
  }, [recordInteraction, triggerFeedbackFollowup]);

  const onTaskStatusChanged = useCallback((taskId: string, newStatus: string) => {
    recordInteraction('task_status_changed', { task_id: taskId, new_status: newStatus });
  }, [recordInteraction]);

  const onDashboardVisit = useCallback(() => {
    recordInteraction('dashboard_visit', { timestamp: new Date().toISOString() });
  }, [recordInteraction]);

  const onTaskDeadlineApproaching = useCallback((taskId: string, daysUntilDue: number) => {
    if (daysUntilDue <= 2) {
      recordInteraction('deadline_approaching', { task_id: taskId, days_until_due: daysUntilDue });
      // Trigger check-in for upcoming deadline
      triggerCheckIn(taskId);
    }
  }, [recordInteraction, triggerCheckIn]);

  // Periodic progress analysis and team interaction scheduling
  useEffect(() => {
    if (!enabled || !sessionId || sessionId === 'undefined' || !user?.id || user.id === 'undefined' || !initialized || !supervisorState?.onboardingCompleted) {
      return;
    }

    const analyzeProgress = async () => {
      try {
        if (!sessionId || sessionId === 'undefined' || !user?.id || user.id === 'undefined') {
          console.log('Skipping analysis - invalid session or user');
          return;
        }

        const hoursSinceLastInteraction = supervisorState?.lastCheckIn 
          ? (Date.now() - new Date(supervisorState.lastCheckIn).getTime()) / (1000 * 60 * 60)
          : 999;

        if (hoursSinceLastInteraction < 4) {
          console.log('Skipping progress analysis - too recent');
          return;
        }

        console.log('Running periodic progress analysis');
        
        const analysis = await AISupervisorService.analyzeProgressAndSuggestCheckIns(sessionId, user.id);
        
        if (analysis.shouldCheckIn) {
          console.log('Triggering check-in based on analysis:', analysis.reason);
          await AISupervisorService.triggerCheckIn(sessionId, user.id, analysis.taskId);
        }

        if (hoursSinceLastInteraction > 12) {
          await AISupervisorService.analyzeAndScheduleTeamInteractions(sessionId, user.id);
        }

        await AISupervisorService.processTeamMessages();

      } catch (error) {
        console.error('Error in progress analysis:', error);
      }
    };

    const interval = setInterval(analyzeProgress, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [enabled, sessionId, user, initialized, supervisorState?.onboardingCompleted, supervisorState?.lastCheckIn]);

  return {
    // State
    supervisorState,
    loading,
    initialized,
    error,
    
    // Actions
    triggerCheckIn,
    triggerFeedbackFollowup,
    recordInteraction,
    analyzeProgressAndSuggestCheckIn,
    
    // Event handlers for integration
    onTaskSubmitted,
    onTaskStatusChanged,
    onDashboardVisit,
    onTaskDeadlineApproaching,
    
    // Utilities
    isEnabled: enabled && !!supervisorState?.isInitialized,
    isOnboarded: supervisorState?.onboardingCompleted || false
  };
} 