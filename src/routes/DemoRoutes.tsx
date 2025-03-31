
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import DesktopOptimizationDemo from "@/pages/DesktopOptimizationDemo";

export const DemoRoutes = () => {
  return (
    <>
      <Route
        path="/desktop-optimization"
        element={
          <ProtectedRoute>
            <DesktopOptimizationDemo />
          </ProtectedRoute>
        }
      />
    </>
  );
};
