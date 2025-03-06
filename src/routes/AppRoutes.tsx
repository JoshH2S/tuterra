
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import InterviewSimulator from "@/pages/InterviewSimulator";
import Index from "@/pages/Index";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/interview" element={<InterviewSimulator />} />
      {/* Add other routes as needed */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
