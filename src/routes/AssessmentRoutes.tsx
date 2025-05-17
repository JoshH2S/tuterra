
import { Route } from "react-router-dom";
import SkillAssessments from "@/pages/SkillAssessments";
import TakeSkillAssessment from "@/pages/TakeSkillAssessment";
import SkillAssessmentResults from "@/pages/SkillAssessmentResults";
import JobInterviewSimulator from "@/pages/JobInterviewSimulator";

export const assessmentRoutes = [
  <Route key="skill-assessments" index element={<SkillAssessments />} />,
  <Route key="take-skill-assessment" path="take-skill-assessment/:id" element={<TakeSkillAssessment />} />,
  <Route key="skill-assessment-results" path="skill-assessment-results/:id" element={<SkillAssessmentResults />} />,
  <Route key="job-interview-simulator" path="job-interview-simulator" element={<JobInterviewSimulator />} />
];
