
import { Route, Navigate } from "react-router-dom";
import Auth from "@/pages/Auth";
import { useAuth } from "@/hooks/useAuth";

// Create a component to handle protected routing with auth check
const AuthRedirect = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />;
};

// Export an array of route elements instead of a component
export const authRoutes = [
  <Route key="auth-root" path="/" element={<AuthRedirect />} />,
  <Route key="auth-page" path="/auth" element={<Auth />} />,
  <Route key="auth-signin" path="/signin" element={<Navigate to="/auth" replace />} />,
  <Route key="auth-signup" path="/signup" element={<Navigate to="/auth?tab=signup" replace />} />,
  <Route key="auth-verify-email" path="/verify-email" element={<Auth mode="emailVerification" />} />,
  <Route key="auth-reset-password" path="/reset-password" element={<Auth mode="resetPassword" />} />
];
