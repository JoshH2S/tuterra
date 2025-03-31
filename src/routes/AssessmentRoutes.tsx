
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import SkillAssessments from "@/pages/SkillAssessments";
import TakeSkillAssessment from "@/pages/TakeSkillAssessment";
import SkillAssessmentResults from "@/pages/SkillAssessmentResults";
import JobInterviewSimulator from "@/pages/JobInterviewSimulator";

export const AssessmentRoutes = () => {
  return (
    <>
      <Route
        path="/skill-assessments"
        element={
          <ProtectedRoute>
            <SkillAssessments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/take-skill-assessment/:id"
        element={
          <ProtectedRoute>
            <TakeSkillAssessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skill-assessment-results/:id"
        element={
          <ProtectedRoute>
            <SkillAssessmentResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-interview-simulator"
        element={
          <ProtectedRoute>
            <JobInterviewSimulator />
          </ProtectedRoute>
        }
      />
    </>
  );
};
