import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import type { UserRole } from "../types";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoutes: Record<UserRole, string> = {
      SysAdmin: "/sysadmin/dashboard",
      DistrictHead: "/districthead/dashboard",
      CollegeAdmin: "/collegeadmin/dashboard",
      Teacher: "/teacher/dashboard",
      Student: "/student/dashboard",
    };

    return <Navigate to={dashboardRoutes[user.role]} replace />;
  }

  return <>{children}</>;
};
