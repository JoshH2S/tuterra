// Course Engine Types
// Matches the database schema for generated courses

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'generating' | 'active' | 'completed' | 'archived';
export type StepType = 'teach' | 'prompt' | 'quiz' | 'checkpoint' | 'reflection';

export interface FormatPreferences {
  historyHeavy?: boolean;
  scenarioHeavy?: boolean;
  quizHeavy?: boolean;
  writingHeavy?: boolean;
}

export interface LearningObjective {
  id: string;
  text: string;
  completed?: boolean;
}

export interface GeneratedCourse {
  id: string;
  user_id: string;
  topic: string;
  goal?: string;
  title: string;
  description?: string;
  level: CourseLevel;
  pace_weeks: number;
  format_preferences: FormatPreferences;
  learning_objectives: LearningObjective[];
  status: CourseStatus;
  context_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface CheckpointSchema {
  type: 'quiz' | 'written' | 'mixed';
  questionCount?: number;
  passingScore?: number;
  rubric?: RubricItem[];
}

export interface RubricItem {
  criterion: string;
  weight: number;
  levels: {
    excellent: string;
    good: string;
    satisfactory: string;
    needsImprovement: string;
  };
}

export interface CourseModule {
  id: string;
  course_id: string;
  module_index: number;
  title: string;
  summary?: string;
  estimated_minutes: number;
  checkpoints_schema: CheckpointSchema;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  steps?: ModuleStep[];
}

export interface ContentSlide {
  title: string;
  content: string;
  keyPoints: string[];
  visualHint: string; // Now required for consistent AI generation
}

export interface StepContent {
  // Legacy fields for backward compatibility
  text?: string;
  keyPoints?: string[];
  
  // New structured fields (nullable superset for OpenAI compatibility)
  slides?: ContentSlide[] | null; // For 'teach' type
  question?: string | null; // For 'prompt' type
  expectedResponse?: string | null; // For 'prompt' type
  hints?: string[] | null; // For 'prompt' type
  questions?: QuizQuestion[] | null; // For 'quiz' and 'checkpoint' types
  instructions?: string | null; // For 'checkpoint' type
  submissionType?: 'text' | 'choice' | 'file' | null; // For 'checkpoint' type
  reflectionPrompts?: string[] | null; // For 'reflection' and 'checkpoint' types
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string; // Now required for consistent feedback
  points: number; // Now required for scoring
}

export interface ModuleStep {
  id: string;
  module_id: string;
  step_index: number;
  step_type: StepType;
  title?: string;
  content: StepContent;
  rubric?: RubricItem[];
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface ModuleCompletion {
  [moduleId: string]: {
    status: 'not_started' | 'in_progress' | 'completed';
    stepsCompleted: number;
    totalSteps: number;
    checkpointsPassed: number;
    totalCheckpoints: number;
  };
}

export interface CourseProgress {
  id: string;
  course_id: string;
  user_id: string;
  current_module_id?: string;
  current_step_id?: string;
  module_completion: ModuleCompletion;
  total_steps_completed: number;
  total_checkpoints_passed: number;
  last_activity_at: string;
  started_at: string;
  completed_at?: string;
  scheduled_start_date?: string; // User's chosen start date from contract
  target_completion_date?: string; // Calculated completion date
  sessions_per_week?: number; // User's commitment (default 2)
  created_at: string;
  updated_at: string;
}

export interface SubmissionData {
  // For quiz/checkpoint responses
  answers?: { [questionId: string]: string };
  
  // For written responses
  text?: string;
  
  // For prompt responses
  response?: string;
  
  // For reflection
  reflections?: string[];
}

export interface AIFeedback {
  overallScore?: number;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
  nextStepGuidance?: string;
  conceptsToReview?: string[];
}

export interface StepSubmission {
  id: string;
  step_id: string;
  user_id: string;
  course_id: string;
  submission: SubmissionData;
  ai_feedback?: AIFeedback;
  score?: number;
  is_passing?: boolean;
  attempt_number: number;
  created_at: string;
}

// API Request/Response types
export interface CreateCourseRequest {
  topic: string;
  goal?: string;
  level: CourseLevel;
  pace_weeks: number;
  format_preferences?: FormatPreferences;
}

export interface CreateCourseResponse {
  course: GeneratedCourse;
  modules: CourseModule[];
}

export interface GenerateModuleStepsRequest {
  course_id: string;
  module_id: string;
}

export interface GenerateModuleStepsResponse {
  steps: ModuleStep[];
}

export interface EvaluateStepRequest {
  step_id: string;
  submission: SubmissionData;
  course_context?: string;
}

export interface EvaluateStepResponse {
  feedback: AIFeedback;
  score?: number;
  is_passing: boolean;
  next_step_id?: string;
}

// UI State types
export interface CourseWizardState {
  step: 1 | 2 | 3;
  topic: string;
  goal: string;
  level: CourseLevel;
  paceWeeks: number;
  formatPreferences: FormatPreferences;
  isGenerating: boolean;
  error?: string;
}

export interface CourseRunnerState {
  currentModuleIndex: number;
  currentStepIndex: number;
  isSubmitting: boolean;
  showFeedback: boolean;
  lastFeedback?: AIFeedback;
}
