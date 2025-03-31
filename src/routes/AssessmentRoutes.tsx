
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import SkillAssessments from "@/pages/SkillAssessments";
import TakeSkillAssessment from "@/pages/TakeSkillAssessment";
import SkillAssessmentResults from "@/pages/SkillAssessmentResults";
import JobInterviewSimulator from "@/pages/JobInterviewSimulator";

export const assessmentRoutes = [
  <Route
    key="skill-assessments"
    path="/skill-assessments"
    element={
      <ProtectedRoute>
        <SkillAssessments />
      </ProtectedRoute>
    }
  />,
  <Route
    key="take-skill-assessment"
    path="/take-skill-assessment/:id"
    element={
      <ProtectedRoute>
        <TakeSkillAssessment />
      </ProtectedRoute>
    }
  />,
  <Route
    key="skill-assessment-results"
    path="/skill-assessment-results/:id"
    element={
      <ProtectedRoute>
        <SkillAssessmentResults />
      </ProtectedRoute>
    }
  />,
  <Route
    key="job-interview-simulator"
    path="/job-interview-simulator"
    element={
      <ProtectedRoute>
        <JobInterviewSimulator />
      </ProtectedRoute>
    }
  />
];
