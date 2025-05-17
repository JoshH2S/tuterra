
import { Route } from "react-router-dom";
import StudentDashboard from "@/pages/StudentDashboard";
import ProfileSettings from "@/pages/ProfileSettings";
import UpdatePassword from "@/pages/UpdatePassword";

export const dashboardRoutes = [
  <Route key="dashboard-index" index element={<StudentDashboard />} />,
  <Route key="dashboard-profile" path="profile-settings" element={<ProfileSettings />} />,
  <Route key="dashboard-password" path="update-password" element={<UpdatePassword />} />
];
