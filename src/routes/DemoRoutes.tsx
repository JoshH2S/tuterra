
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import DesktopOptimizationDemo from "@/pages/DesktopOptimizationDemo";

export const demoRoutes = [
  <Route
    key="desktop-optimization"
    path="/desktop-optimization"
    element={
      <ProtectedRoute>
        <DesktopOptimizationDemo />
      </ProtectedRoute>
    }
  />
];
