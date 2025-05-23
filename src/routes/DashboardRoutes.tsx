
import { Route } from "react-router-dom";
import StudentDashboard from "@/pages/StudentDashboard";
import ProfileSettings from "@/pages/ProfileSettings";
import UpdatePassword from "@/pages/UpdatePassword";
import VirtualInternshipDashboard from "@/pages/VirtualInternshipDashboard";
import InternshipSetupPage from "@/pages/InternshipSetupPage";

export const dashboardRoutes = [
  <Route key="dashboard-index" path="/" element={<StudentDashboard />} />,
  <Route key="dashboard-profile" path="profile-settings" element={<ProfileSettings />} />,
  <Route key="dashboard-password" path="update-password" element={<UpdatePassword />} />,
  <Route key="dashboard-internship" path="internship" element={<VirtualInternshipDashboard />} />,
  <Route key="dashboard-internship-direct" path="virtual-internship" element={<VirtualInternshipDashboard />} />,
  <Route key="dashboard-internship-create" path="internship/create" element={<InternshipSetupPage />} />
];
