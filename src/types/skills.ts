// Skills system types
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'communication' | 'analysis' | 'creative' | 'leadership';
  max_level: number;
  xp_per_level: number;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface UserSkillProgress {
  id: string;
  user_id: string;
  skill_id: string;
  current_xp: number;
  current_level: number;
  total_submissions: number;
  best_submission_id?: string;
  evidence_submissions: string[];
  last_activity: string;
  created_at: string;
  updated_at: string;
  skill?: Skill; // Joined skill data
}

export interface SkillAnalysis {
  skill_name: string;
  evidence_quality: 'high' | 'medium' | 'low';
  specific_examples: string[];
  improvement_suggestions: string[];
}

export interface SkillsEarned {
  [skillId: string]: {
    xp_earned: number;
    proficiency_score: number;
  };
}

export interface TaskSkillMapping {
  id: string;
  task_id: string;
  skill_id: string;
  xp_reward: number;
  proficiency_weight: number;
  created_at: string;
}

// Component prop types
export interface SkillCardProps {
  skill: Skill;
  progress: UserSkillProgress;
  onClick?: () => void;
}

export interface SkillsDashboardProps {
  sessionId: string;
  userId: string;
}

export interface SkillProgressBarProps {
  currentXp: number;
  currentLevel: number;
  xpPerLevel: number;
  maxLevel: number;
  color?: string;
  showLabels?: boolean;
}

export interface XPGainNotificationProps {
  skillName: string;
  xpGained: number;
  newLevel?: number;
  isVisible: boolean;
  onClose: () => void;
}

// Utility types
export type SkillCategory = 'technical' | 'communication' | 'analysis' | 'creative' | 'leadership';

export interface SkillCategoryInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const SKILL_CATEGORIES: Record<SkillCategory, SkillCategoryInfo> = {
  technical: {
    name: 'Technical',
    description: 'Programming, tools, and technical expertise',
    icon: 'Code',
    color: '#3B82F6'
  },
  communication: {
    name: 'Communication',
    description: 'Writing, presenting, and interpersonal skills',
    icon: 'MessageSquare',
    color: '#10B981'
  },
  analysis: {
    name: 'Analysis',
    description: 'Data analysis, research, and problem-solving',
    icon: 'BarChart',
    color: '#8B5CF6'
  },
  creative: {
    name: 'Creative',
    description: 'Design, marketing, and innovative thinking',
    icon: 'Palette',
    color: '#EC4899'
  },
  leadership: {
    name: 'Leadership',
    description: 'Project management, team coordination, and strategic thinking',
    icon: 'Users',
    color: '#F59E0B'
  }
};
