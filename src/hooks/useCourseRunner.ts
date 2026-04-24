import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  GeneratedCourse,
  CourseModule,
  ModuleStep,
  CourseProgress,
  StepSubmission,
  SubmissionData,
  AIFeedback,
  CourseLevel,
  FormatPreferences,
} from '@/types/course-engine';

interface UseCourseRunnerReturn {
  course: GeneratedCourse | null;
  modules: CourseModule[];
  currentModule: CourseModule | null;
  currentStep: ModuleStep | null;
  steps: ModuleStep[];
  progress: CourseProgress | null;
  isLoading: boolean;
  isLoadingSteps: boolean;
  isSubmitting: boolean;
  lastFeedback: AIFeedback | null;
  previousSubmission: StepSubmission | null;
  lastSubmissionPassing: boolean | null;
  loadCourse: (courseId: string) => Promise<void>;
  loadModuleSteps: (moduleId: string) => Promise<void>;
  submitStep: (submission: SubmissionData) => Promise<{ success: boolean; nextStepId?: string }>;
  markStepComplete: (stepId?: string) => Promise<{ success: boolean; nextStepId?: string }>;
  navigateToStep: (stepId: string) => void;
  navigateToModule: (moduleIndex: number) => void;
  getProgressPercentage: () => number;
}

export const useCourseRunner = (): UseCourseRunnerReturn => {
  const [course, setCourse] = useState<GeneratedCourse | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [steps, setSteps] = useState<ModuleStep[]>([]);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [currentStep, setCurrentStep] = useState<ModuleStep | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<AIFeedback | null>(null);
  const [previousSubmission, setPreviousSubmission] = useState<StepSubmission | null>(null);
  const [lastSubmissionPassing, setLastSubmissionPassing] = useState<boolean | null>(null);

  // Dedup guard: prevent concurrent calls to loadModuleSteps for the same module
  const activeModuleLoadRef = useRef<string | null>(null);

  // Fetch the most recent submission for the current step whenever the step changes
  useEffect(() => {
    if (!currentStep || currentStep.step_type === 'teach') {
      setPreviousSubmission(null);
      setLastSubmissionPassing(null);
      return;
    }

    let cancelled = false;

    const fetchPreviousSubmission = async () => {
      const { data } = await supabase
        .from('step_submissions')
        .select('*')
        .eq('step_id', currentStep.id)
        .order('attempt_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setPreviousSubmission({
          id: data.id,
          step_id: data.step_id,
          user_id: data.user_id,
          course_id: data.course_id,
          submission: data.submission as SubmissionData,
          ai_feedback: data.ai_feedback as AIFeedback | undefined,
          score: data.score ?? undefined,
          is_passing: data.is_passing ?? undefined,
          attempt_number: data.attempt_number,
          created_at: data.created_at,
        });
        setLastSubmissionPassing(data.is_passing ?? null);
      } else {
        setPreviousSubmission(null);
        setLastSubmissionPassing(null);
      }
    };

    fetchPreviousSubmission();

    return () => { cancelled = true; };
  }, [currentStep?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCourse = useCallback(async (courseId: string) => {
    setIsLoading(true);
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('generated_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      const transformedCourse: GeneratedCourse = {
        id: courseData.id,
        user_id: courseData.user_id,
        topic: courseData.topic,
        goal: courseData.goal || undefined,
        title: courseData.title,
        description: courseData.description || undefined,
        level: courseData.level as CourseLevel,
        pace_weeks: courseData.pace_weeks,
        format_preferences: (courseData.format_preferences || {}) as FormatPreferences,
        learning_objectives: Array.isArray(courseData.learning_objectives)
          ? courseData.learning_objectives as unknown as GeneratedCourse['learning_objectives']
          : [],
        status: courseData.status as GeneratedCourse['status'],
        context_summary: courseData.context_summary || undefined,
        created_at: courseData.created_at,
        updated_at: courseData.updated_at,
      };

      setCourse(transformedCourse);

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('module_index', { ascending: true });

      if (modulesError) throw modulesError;
      
      // Transform modules
      const transformedModules: CourseModule[] = (modulesData || []).map(m => ({
        id: m.id,
        course_id: m.course_id,
        module_index: m.module_index,
        title: m.title,
        summary: m.summary || undefined,
        estimated_minutes: m.estimated_minutes,
        checkpoints_schema: (m.checkpoints_schema || { type: 'quiz', questionCount: 5, passingScore: 70 }) as unknown as CourseModule['checkpoints_schema'],
        is_completed: m.is_completed,
        completed_at: m.completed_at || undefined,
        created_at: m.created_at,
        updated_at: m.updated_at,
      }));
      
      setModules(transformedModules);

      // Fetch or create progress
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!progressData) {
        const { data: newProgress, error: progressError } = await supabase
          .from('course_progress')
          .insert({
            course_id: courseId,
            user_id: user.id,
            current_module_id: transformedModules?.[0]?.id,
            module_completion: {},
          })
          .select()
          .single();

        if (progressError) throw progressError;
        progressData = newProgress;
      }

      // Transform progress data
      const transformedProgress: CourseProgress = {
        id: progressData.id,
        course_id: progressData.course_id,
        user_id: progressData.user_id,
        current_module_id: progressData.current_module_id || undefined,
        current_step_id: progressData.current_step_id || undefined,
        module_completion: (progressData.module_completion || {}) as unknown as CourseProgress['module_completion'],
        total_steps_completed: progressData.total_steps_completed,
        total_checkpoints_passed: progressData.total_checkpoints_passed,
        last_activity_at: progressData.last_activity_at,
        started_at: progressData.started_at,
        completed_at: progressData.completed_at || undefined,
        created_at: progressData.created_at,
        updated_at: progressData.updated_at,
      };

      setProgress(transformedProgress);

      // Set current module from transformed data
      if (transformedModules && transformedModules.length > 0) {
        const currentMod = transformedProgress?.current_module_id
          ? transformedModules.find(m => m.id === transformedProgress.current_module_id)
          : transformedModules[0];
        setCurrentModule(currentMod || transformedModules[0]);
      }
    } catch (err) {
      console.error('Error loading course:', err);
      toast({
        title: 'Error',
        description: 'Failed to load course. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadModuleSteps = useCallback(async (moduleId: string) => {
    if (!course) return;

    // Dedup: skip if we're already loading this exact module
    if (activeModuleLoadRef.current === moduleId) {
      console.log('[useCourseRunner] Skipping duplicate loadModuleSteps for', moduleId);
      return;
    }
    activeModuleLoadRef.current = moduleId;

    setIsLoadingSteps(true);
    setSteps([]);

    try {
      const response = await supabase.functions.invoke('generate-module-steps', {
        body: {
          course_id: course.id,
          module_id: moduleId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to load steps');
      }

      const result = response.data;

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to load steps');
      }

      // Only update state if this is still the active load (not superseded by a newer request)
      if (activeModuleLoadRef.current === moduleId) {
        setSteps(result.steps);
        if (result.steps.length > 0) {
          let targetStep: ModuleStep | undefined;
          if (progress?.current_step_id) {
            targetStep = result.steps.find((s: ModuleStep) => s.id === progress.current_step_id);
          }
          if (!targetStep) {
            targetStep = result.steps.find((s: ModuleStep) => !s.is_completed);
          }
          setCurrentStep(targetStep || result.steps[0]);
        }
      }
    } catch (err) {
      console.error('Error loading steps:', err);
      if (activeModuleLoadRef.current === moduleId) {
        toast({
          title: 'Error',
          description: 'Failed to load module content. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      if (activeModuleLoadRef.current === moduleId) {
        setIsLoadingSteps(false);
        activeModuleLoadRef.current = null;
      }
    }
  }, [course]);

  const submitStep = useCallback(async (submission: SubmissionData) => {
    if (!currentStep || !course) {
      return { success: false };
    }

    setIsSubmitting(true);
    setLastFeedback(null);

    try {
      const response = await supabase.functions.invoke('evaluate-step', {
        body: {
          step_id: currentStep.id,
          course_id: course.id,
          submission,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to submit');
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      const feedback: AIFeedback = result.feedback ?? {
        feedback: 'Your response was submitted successfully.',
        overallScore: result.is_passing ? 80 : 50,
      };

      setLastFeedback(feedback);
      setLastSubmissionPassing(result.is_passing);

      // Persist the submission in memory so the form can be pre-populated on retry
      setPreviousSubmission({
        id: '',
        step_id: currentStep.id,
        user_id: '',
        course_id: course.id,
        submission,
        ai_feedback: feedback,
        score: feedback.overallScore,
        is_passing: result.is_passing,
        attempt_number: 1,
        created_at: new Date().toISOString(),
      });

      // Update step completion locally
      if (result.is_passing) {
        setSteps(prev =>
          prev.map(s =>
            s.id === currentStep.id
              ? { ...s, is_completed: true, completed_at: new Date().toISOString() }
              : s
          )
        );

        // Update progress
        setProgress(prev => prev ? {
          ...prev,
          total_steps_completed: (prev.total_steps_completed || 0) + 1,
          last_activity_at: new Date().toISOString(),
        } : null);
      }

      return {
        success: true,
        nextStepId: result.next_step_id,
      };
    } catch (err) {
      console.error('Error submitting step:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit your response. Please try again.',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, course]);

  const markStepComplete = useCallback(async (stepId?: string) => {
    const targetStep = stepId ? steps.find(s => s.id === stepId) : currentStep;
    if (!targetStep || !course) {
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      const response = await supabase.functions.invoke('mark-step-complete', {
        body: {
          step_id: targetStep.id,
          course_id: course.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to mark step complete');
      }

      const result = response.data;

      if (!result.success) {
        throw new Error('Failed to mark step complete');
      }

      // Update step completion locally
      setSteps(prev =>
        prev.map(s =>
          s.id === targetStep.id
            ? { ...s, is_completed: true, completed_at: new Date().toISOString() }
            : s
        )
      );

      // Update progress with server response
      setProgress(prev => prev ? {
        ...prev,
        total_steps_completed: result.completed_steps,
        last_activity_at: new Date().toISOString(),
      } : null);

      return {
        success: true,
        nextStepId: result.next_step_id,
      };
    } catch (err) {
      console.error('Error marking step complete:', err);
      toast({
        title: 'Error',
        description: 'Failed to complete step. Please try again.',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, course, steps]);

  const navigateToStep = useCallback((stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (step) {
      setCurrentStep(step);
      setLastFeedback(null);
      // Clear immediately so stale data from the previous step never reaches the form
      setPreviousSubmission(null);
      setLastSubmissionPassing(null);

      // Persist position so a page refresh returns the user to this exact step
      if (course && progress) {
        supabase
          .from('course_progress')
          .update({
            current_step_id: stepId,
            last_activity_at: new Date().toISOString(),
          })
          .eq('course_id', course.id)
          .eq('user_id', progress.user_id)
          .then(({ error }) => {
            if (error) console.error('[useCourseRunner] Failed to persist step position:', error);
          });
      }
    }
  }, [steps, course, progress]);

  const navigateToModule = useCallback((moduleIndex: number) => {
    const module = modules.find(m => m.module_index === moduleIndex);
    if (module) {
      setCurrentModule(module);
      setLastFeedback(null);

      // Persist module position so a page refresh lands on the right module
      if (course && progress) {
        supabase
          .from('course_progress')
          .update({
            current_module_id: module.id,
            last_activity_at: new Date().toISOString(),
          })
          .eq('course_id', course.id)
          .eq('user_id', progress.user_id)
          .then(({ error }) => {
            if (error) console.error('[useCourseRunner] Failed to persist module position:', error);
          });
      }
    }
  }, [modules, course, progress]);

  const getProgressPercentage = useCallback(() => {
    // Use step-based progress instead of module-based for better granularity
    if (!progress || !progress.total_steps_completed) return 0;
    
    // Calculate total steps across all modules
    const totalStepsAcrossCourse = modules.reduce((total, module) => {
      // Each module has 6 steps by default (2 teach, 2 prompt, 1 quiz, 1 checkpoint)
      return total + 6;
    }, 0);

    if (totalStepsAcrossCourse === 0) return 0;
    
    return Math.round((progress.total_steps_completed / totalStepsAcrossCourse) * 100);
  }, [progress, modules]);

  return {
    course,
    modules,
    currentModule,
    currentStep,
    steps,
    progress,
    isLoading,
    isLoadingSteps,
    isSubmitting,
    lastFeedback,
    previousSubmission,
    lastSubmissionPassing,
    loadCourse,
    loadModuleSteps,
    submitStep,
    markStepComplete,
    navigateToStep,
    navigateToModule,
    getProgressPercentage,
  };
};
