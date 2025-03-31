
import { Route, Navigate } from "react-router-dom";
import Auth from "@/pages/Auth";
import { useAuth } from "@/hooks/useAuth";

export const AuthRoutes = () => {
  const { user } = useAuth();
  
  return (
    <>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/verify-email" element={<Auth mode="emailVerification" />} />
      <Route path="/reset-password" element={<Auth mode="resetPassword" />} />
    </>
  );
};
