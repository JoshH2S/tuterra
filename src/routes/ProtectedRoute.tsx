
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // For now, we'll just return the children
  // This can be enhanced later with authentication checks
  return <>{children}</>;
};

export default ProtectedRoute;
