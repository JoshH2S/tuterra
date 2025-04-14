
import { SkillAssessment as BaseSkillAssessment } from "@/hooks/skill-assessment/types";

// Type definition for skill assessment display
export interface SkillAssessmentDisplay extends BaseSkillAssessment {
  created_at: string;
  creator_id: string;
}

// Type for the assessment card props
export interface AssessmentCardProps {
  assessment: SkillAssessmentDisplay;
  onViewAssessment: (id: string) => void;
}

// Type for the skill assessments list props
export interface SkillAssessmentsListProps {
  onViewAssessment: (id: string) => void;
  searchQuery?: string;
  renderItem?: (assessment: SkillAssessmentDisplay) => React.ReactNode;
}
