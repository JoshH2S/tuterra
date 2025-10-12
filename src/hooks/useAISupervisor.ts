import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { AISupervisorService } from "@/services/aiSupervisor";
import { useToast } from "./use-toast";
import { debounce } from "../utils/debounce";

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

interface MessageNotification {
  type: 'onboarding' | 'check_in' | 'team_introduction' | 'feedback_followup' | 'general';
  title: string;
  description: string;
  duration?: number;
  priority?: 'low' | 'medium' | 'high';
}

// Constants
const MAX_RETRIES = 2;
const NOTIFICATION_COOLDOWN = 5000;
const DASHBOARD_VISIT_DEBOUNCE = 1000;
const ANALYSIS_INTERVAL = 10 * 60 * 1000; // 10 minutes
const MIN_ANALYSIS_GAP = 2 * 60 * 1000;   // 2 minutes minimum between analyses

interface InitializationState {
  dashboardVisitRecorded: boolean;
  onboardingTriggered: boolean;
  supervisorInitialized: boolean;
  retryAttempts: number;
  lastAnalysisTime: number;
  pendingCheckIns: Set<string>;
  lastNotificationTimes: Record<string, number>;
}

export function useAISupervisor({ sessionId, enabled = true }: UseAISupervisorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [supervisorState, setSupervisorState] = useState<SupervisorState | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced initialization tracking
  const initializationRef = useRef<InitializationState>({
    dashboardVisitRecorded: false,
    onboardingTriggered: false,
    supervisorInitialized: false,
    retryAttempts: 0,
    lastAnalysisTime: 0,
    pendingCheckIns: new Set(),
    lastNotificationTimes: {}
  });

  // Track pending operations for cleanup
  const pendingOperations = useRef<Array<NodeJS.Timeout>>([]);

  // Helper to clean up pending operations
  const cleanupPendingOperations = useCallback(() => {
    pendingOperations.current.forEach(clearTimeout);
    pendingOperations.current = [];
  }, []);

  // Enhanced session validation
  const isValidSession = useCallback(() => {
    if (!sessionId || !user?.id || !enabled) return false;

    const isValidId = (id: string) => {
      return id.trim() !== '' && 
             id !== 'undefined' && 
             id !== 'null' &&
             id.length > 0;
    };

    return isValidId(sessionId) && isValidId(user.id);
  }, [sessionId, user?.id, enabled]);

  // Enhanced notification system with rate limiting and priority
  const showMessageNotification = useCallback((messageType: string, context?: any) => {
    const now = Date.now();
    const lastNotification = initializationRef.current.lastNotificationTimes[messageType];
    
    // Check notification cooldown
    if (lastNotification && (now - lastNotification) < NOTIFICATION_COOLDOWN) {
      console.log('Skipping notification - too recent:', messageType);
      return;
    }

    const notifications: Record<string, MessageNotification> = {
      onboarding: {
        type: 'onboarding',
        title: "Welcome to Your Internship!",
        description: `Your supervisor ${supervisorState?.supervisorName || 'has'} sent you a welcome message. Check the Messages tab to get started.`,
        duration: 6000,
        priority: 'high'
      },
      check_in: {
        type: 'check_in',
        title: "Check-in from Supervisor",
        description: "Your supervisor wants to check on your progress. View the message in the Messages tab.",
        duration: 4000,
        priority: 'medium'
      },
      team_introduction: {
        type: 'team_introduction',
        title: "Team Introduction",
        description: "A team member has introduced themselves! Check your messages to connect with your colleagues.",
        duration: 5000,
        priority: 'medium'
      },
      feedback_followup: {
        type: 'feedback_followup',
        title: "Feedback Follow-up",
        description: "Your supervisor has provided additional feedback on your recent submission.",
        duration: 4000,
        priority: 'high'
      },
      general: {
        type: 'general',
        title: "New Message",
        description: "You have a new message from your internship team.",
        duration: 3000,
        priority: 'low'
      }
    };

    const notification = notifications[messageType] || notifications.general;
    
    try {
      // Update notification history before showing
      initializationRef.current.lastNotificationTimes[messageType] = now;
      
      toast({
        title: notification.title,
        description: notification.description,
        duration: notification.duration,
        // Add any custom styling based on priority
        className: `priority-${notification.priority}`
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
      // Remove from history if failed
      delete initializationRef.current.lastNotificationTimes[messageType];
    }
  }, [toast, supervisorState?.supervisorName]);

  // Initialize supervisor with retry logic
  const initializeSupervisor = useCallback(async (retryCount = 0) => {
    if (!isValidSession()) {
      console.log('Skipping supervisor initialization - invalid session');
      return;
    }

    if (initializationRef.current.supervisorInitialized) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const state = await AISupervisorService.initializeSupervisor(sessionId!, user!.id);
      setSupervisorState({
        isInitialized: true,
        onboardingCompleted: state.onboarding_completed,
        lastCheckIn: state.last_check_in_at,
        totalInteractions: state.total_interactions,
        supervisorName: state.supervisor_name
      });
      setInitialized(true);
      initializationRef.current.supervisorInitialized = true;
      initializationRef.current.retryAttempts = 0;
    } catch (error) {
      console.error('Error initializing supervisor:', error);
      
      if (retryCount < MAX_RETRIES) {
        const timeout = setTimeout(() => {
          initializeSupervisor(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000);
        pendingOperations.current.push(timeout);
      } else {
        if (enabled) {
          setError(error instanceof Error ? error.message : 'Failed to initialize supervisor');
        }
        initializationRef.current.retryAttempts = 0;
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId, user, enabled, isValidSession]);

  // Enhanced onboarding trigger with retry logic
  const triggerOnboardingIfNeeded = useCallback(async (retryCount = 0) => {
    if (!isValidSession() || !supervisorState || initializationRef.current.onboardingTriggered) {
      return;
    }

    if (!supervisorState.onboardingCompleted) {
      try {
        const existingMessages = await AISupervisorService.getSupervisorMessages(sessionId!, user!.id);
        const hasOnboardingMessage = existingMessages.some(msg => msg.message_type === 'onboarding');
        
        if (hasOnboardingMessage) {
          console.log('Onboarding message already exists');
          setSupervisorState(prev => prev ? { ...prev, onboardingCompleted: true } : null);
          initializationRef.current.onboardingTriggered = true;
          return;
        }
        
        console.log('Triggering onboarding for session:', sessionId);
        await AISupervisorService.triggerOnboarding(sessionId!, user!.id);
        
        showMessageNotification('onboarding');

        setSupervisorState(prev => prev ? {
          ...prev,
          onboardingCompleted: true,
          totalInteractions: prev.totalInteractions + 1
        } : null);

        initializationRef.current.onboardingTriggered = true;

        // Schedule team introductions with retry logic
        const scheduleTeamIntros = async (retryCount = 0) => {
          try {
            const shouldScheduleTeam = await AISupervisorService.shouldScheduleTeamIntroductions(sessionId!, user!.id);
            if (shouldScheduleTeam) {
              await AISupervisorService.scheduleTeamIntroductions(sessionId!, user!.id);
              showMessageNotification('team_introduction');
            }
          } catch (error) {
            console.error('Error scheduling team introductions:', error);
            if (retryCount < MAX_RETRIES) {
              const timeout = setTimeout(() => {
                scheduleTeamIntros(retryCount + 1);
              }, Math.pow(2, retryCount) * 1000);
              pendingOperations.current.push(timeout);
            }
          }
        };

        const timeout = setTimeout(() => scheduleTeamIntros(), 2000);
        pendingOperations.current.push(timeout);

      } catch (error) {
        console.error('Error triggering onboarding:', error);
        if (retryCount < MAX_RETRIES) {
          const timeout = setTimeout(() => {
            triggerOnboardingIfNeeded(retryCount + 1);
          }, Math.pow(2, retryCount) * 1000);
          pendingOperations.current.push(timeout);
        } else {
          initializationRef.current.onboardingTriggered = false;
        }
      }
    }
  }, [sessionId, user, enabled, supervisorState, showMessageNotification, isValidSession]);

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

  // Enhanced interaction recording with retry
  const recordInteraction = useCallback(async (interactionType: string, context: any = {}, retryCount = 0) => {
    if (!isValidSession()) {
      return;
    }

    try {
      await AISupervisorService.recordInteraction(sessionId!, user!.id, interactionType, context);
    } catch (error) {
      console.error('Error recording interaction:', error);
      if (retryCount < MAX_RETRIES) {
        const timeout = setTimeout(() => {
          recordInteraction(interactionType, context, retryCount + 1);
        }, Math.pow(2, retryCount) * 1000);
        pendingOperations.current.push(timeout);
      }
    }
  }, [sessionId, user, enabled, isValidSession]);

  // Message queue for handling incoming messages
  const messageQueue = useRef<Array<{ type: string; context: any }>>([]);
  const isProcessingQueue = useRef(false);

  const processMessageQueue = useCallback(async () => {
    if (isProcessingQueue.current || messageQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    
    try {
      while (messageQueue.current.length > 0) {
        const message = messageQueue.current.shift();
        if (message) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Delay between messages
          showMessageNotification(message.type, message.context);
        }
      }
    } finally {
      isProcessingQueue.current = false;
    }
  }, [showMessageNotification]);

  // Enhanced message handler with queue
  const handleIncomingMessage = useCallback((messageType: string, context?: any) => {
    console.log('New message received:', messageType, context);
    messageQueue.current.push({ type: messageType, context });
    processMessageQueue();
  }, [processMessageQueue]);

  // Debounced dashboard visit recording
  const debouncedRecordDashboardVisit = useCallback(
    debounce(() => {
      if (!isValidSession() || 
          !supervisorState?.isInitialized || 
          initializationRef.current.dashboardVisitRecorded) {
        return;
      }

      console.log('Recording dashboard visit for session:', sessionId);
      recordInteraction('dashboard_visit', { timestamp: new Date().toISOString() });
      initializationRef.current.dashboardVisitRecorded = true;
    }, DASHBOARD_VISIT_DEBOUNCE),
    [sessionId, supervisorState?.isInitialized, isValidSession, recordInteraction]
  );

  // Reset state when session changes
  useEffect(() => {
    cleanupPendingOperations();
    initializationRef.current = {
      dashboardVisitRecorded: false,
      onboardingTriggered: false,
      supervisorInitialized: false,
      retryAttempts: 0,
      lastAnalysisTime: 0,
      pendingCheckIns: new Set(),
      lastNotificationTimes: {}
    };
    messageQueue.current = [];
    isProcessingQueue.current = false;
  }, [sessionId, cleanupPendingOperations]);

  // Initialize supervisor
  useEffect(() => {
    initializeSupervisor();
  }, [initializeSupervisor]);

  // Trigger onboarding after initialization
  useEffect(() => {
    if (supervisorState?.isInitialized && !initializationRef.current.onboardingTriggered) {
      const timer = setTimeout(() => {
        triggerOnboardingIfNeeded();
      }, 500);
      pendingOperations.current.push(timer);
      return () => clearTimeout(timer);
    }
  }, [supervisorState?.isInitialized, triggerOnboardingIfNeeded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPendingOperations();
    };
  }, [cleanupPendingOperations]);

  // CONSOLIDATED: Single effect for all periodic operations
  useEffect(() => {
    if (!enabled || !supervisorState?.onboardingCompleted || !initialized) {
      console.log('Periodic analysis disabled - prerequisites not met');
      return;
    }

    console.log('Setting up consolidated periodic analysis');
    
    const runPeriodicTasks = async () => {
      const now = Date.now();
      const timeSinceLastAnalysis = now - initializationRef.current.lastAnalysisTime;
      
      if (timeSinceLastAnalysis < MIN_ANALYSIS_GAP) {
        console.log('Skipping analysis - too soon since last run');
        return;
      }

      console.log('Running periodic analysis tasks');
      initializationRef.current.lastAnalysisTime = now;

      try {
        // Run core analysis
        await analyzeProgressAndSuggestCheckIn();
        
        // Process any scheduled messages
        await AISupervisorService.processScheduledMessages();
        
        // Occasionally check team interactions (30% chance)
        if (Math.random() < 0.3) {
          await AISupervisorService.analyzeAndScheduleTeamInteractions(sessionId!, user!.id);
        }
      } catch (error) {
        console.error('Error in periodic tasks:', error);
      }
    };

    // Initial run after a short delay
    const initialTimeout = setTimeout(runPeriodicTasks, 1000);
    
    // Set up interval for subsequent runs
    const interval = setInterval(runPeriodicTasks, ANALYSIS_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      console.log('Cleaned up periodic analysis');
    };
  }, [enabled, supervisorState?.onboardingCompleted, initialized, sessionId, user?.id]);

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
    debouncedRecordDashboardVisit();
  }, [debouncedRecordDashboardVisit]);

  const onTaskDeadlineApproaching = useCallback((taskId: string, daysUntilDue: number) => {
    if (daysUntilDue <= 2) {
      recordInteraction('deadline_approaching', { task_id: taskId, days_until_due: daysUntilDue });
      // Trigger check-in for upcoming deadline
      triggerCheckIn(taskId);
    }
  }, [recordInteraction, triggerCheckIn]);

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
    isOnboarded: supervisorState?.onboardingCompleted || false,
    isValidSession
  };
} 