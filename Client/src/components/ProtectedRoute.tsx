import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: Array<"RECRUITER" | "INDIVIDUAL">;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#090d16] text-[#ccff00]">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <span className="text-sm font-medium tracking-wide">Validating session security...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If authenticated but role mismatch, bounce back to their dashboard
    return <Navigate to={role === "RECRUITER" ? "/dashboard" : "/individual/profile"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
