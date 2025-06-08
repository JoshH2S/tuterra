import { Route } from "react-router-dom";
import StudentDashboard from "@/pages/StudentDashboard";
import ProfileSettings from "@/pages/ProfileSettings";
import UpdatePassword from "@/pages/UpdatePassword";
import VirtualInternshipDashboard from "@/pages/VirtualInternshipDashboard";
import InternshipOverviewPage from "@/pages/InternshipOverviewPage";
import InternshipSetupPage from "@/pages/InternshipSetupPage";
import SubmitFinalProjectPage from "@/pages/SubmitFinalProjectPage";
import InternshipCompletionPage from "@/pages/InternshipCompletionPage";
import WelcomePage from "@/pages/virtual-internship/WelcomePage";
import { DebugTaskSubmission } from "@/components/internship/DebugTaskSubmission";

export const dashboardRoutes = [
  <Route key="dashboard-index" path="/" element={<StudentDashboard />} />,
  <Route key="dashboard-profile" path="profile-settings" element={<ProfileSettings />} />,
  <Route key="dashboard-password" path="update-password" element={<UpdatePassword />} />,
  <Route key="dashboard-internship" path="internship" element={<InternshipOverviewPage />} />,
  <Route key="dashboard-internships" path="internships" element={<InternshipOverviewPage />} />,
  <Route key="dashboard-internship-direct" path="virtual-internship" element={<VirtualInternshipDashboard />} />,
  <Route key="dashboard-internship-welcome" path="virtual-internship/welcome" element={<WelcomePage />} />,
  <Route key="dashboard-internship-welcome-id" path="virtual-internship/welcome/:sessionId" element={<WelcomePage />} />,
  <Route key="dashboard-internship-overview" path="virtual-internship/overview" element={<InternshipOverviewPage />} />,
  <Route key="dashboard-internship-create" path="internship/create" element={<InternshipSetupPage />} />,
  <Route key="dashboard-internship-new" path="virtual-internship/new" element={<InternshipSetupPage />} />,
  <Route 
    key="dashboard-internship-final-project" 
    path="virtual-internship/submit-final" 
    element={<SubmitFinalProjectPage />} 
  />,
  <Route 
    key="dashboard-internship-completion" 
    path="virtual-internship/completion" 
    element={<InternshipCompletionPage />} 
  />,
  <Route 
    key="dashboard-internship-debug" 
    path="virtual-internship/debug" 
    element={<DebugTaskSubmission />} 
  />
];
