
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import StudentDashboard from "@/pages/StudentDashboard";
import ProfileSettings from "@/pages/ProfileSettings";
import UpdatePassword from "@/pages/UpdatePassword";

export const dashboardRoutes = [
  <Route
    key="dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <StudentDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="profile-settings"
    path="/profile-settings"
    element={
      <ProtectedRoute>
        <ProfileSettings />
      </ProtectedRoute>
    }
  />,
  <Route
    key="update-password"
    path="/update-password"
    element={
      <ProtectedRoute>
        <UpdatePassword />
      </ProtectedRoute>
    }
  />
];
