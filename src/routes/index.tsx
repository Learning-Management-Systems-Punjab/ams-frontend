import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ErrorBoundary } from "../components/ErrorBoundary";

// Auth Pages
import { Login } from "../pages/auth/Login";

// SysAdmin Pages
import { SysAdminDashboard } from "../pages/sysadmin/Dashboard";
import { RegionsPage } from "../pages/sysadmin/RegionsPage";
import DistrictHeadsPage from "../pages/sysadmin/DistrictHeadsPage";
import CollegesPage from "../pages/sysadmin/CollegesPage";
import TeachersPage from "../pages/sysadmin/TeachersPage";
import StudentsPage from "../pages/sysadmin/StudentsPage";
import SubjectsPage from "../pages/sysadmin/SubjectsPage";

// DistrictHead Pages
import { DistrictHeadDashboard } from "../pages/districthead/Dashboard";

// CollegeAdmin Pages
import { CollegeAdminDashboard } from "../pages/collegeadmin/Dashboard";
import CollegeAdminTeachersPage from "../pages/collegeadmin/TeachersPage";
import CollegeAdminStudentsPage from "../pages/collegeadmin/StudentsPage";

// Teacher Pages
import { TeacherDashboard } from "../pages/teacher/Dashboard";

// Student Pages
import { StudentDashboard } from "../pages/student/Dashboard";

// Error Pages
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-600 mt-2">Page not found</p>
    </div>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900">403</h1>
      <p className="text-gray-600 mt-2">Unauthorized Access</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  // SysAdmin Routes
  {
    path: "/sysadmin",
    element: (
      <ProtectedRoute allowedRoles={["SysAdmin"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <SysAdminDashboard />,
      },
      {
        path: "regions",
        element: (
          <ErrorBoundary>
            <RegionsPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "district-heads",
        element: (
          <ErrorBoundary>
            <DistrictHeadsPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "colleges",
        element: (
          <ErrorBoundary>
            <CollegesPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "teachers",
        element: (
          <ErrorBoundary>
            <TeachersPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "students",
        element: (
          <ErrorBoundary>
            <StudentsPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "subjects",
        element: (
          <ErrorBoundary>
            <SubjectsPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "reports",
        element: <div>Reports Page</div>,
      },
      {
        path: "settings",
        element: <div>Settings Page</div>,
      },
    ],
  },
  // DistrictHead Routes
  {
    path: "/districthead",
    element: (
      <ProtectedRoute allowedRoles={["DistrictHead"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DistrictHeadDashboard />,
      },
      {
        path: "colleges",
        element: <div>Colleges Page</div>,
      },
      {
        path: "teachers",
        element: <div>Teachers Page</div>,
      },
      {
        path: "students",
        element: <div>Students Page</div>,
      },
      {
        path: "subjects",
        element: <div>Subjects Page</div>,
      },
      {
        path: "reports",
        element: <div>Reports Page</div>,
      },
      {
        path: "settings",
        element: <div>Settings Page</div>,
      },
    ],
  },
  // CollegeAdmin Routes
  {
    path: "/collegeadmin",
    element: (
      <ProtectedRoute allowedRoles={["CollegeAdmin"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <CollegeAdminDashboard />,
      },
      {
        path: "teachers",
        element: <CollegeAdminTeachersPage />,
      },
      {
        path: "students",
        element: <CollegeAdminStudentsPage />,
      },
      {
        path: "subjects",
        element: <div>Subjects Page</div>,
      },
      {
        path: "attendance",
        element: <div>Attendance Page</div>,
      },
      {
        path: "reports",
        element: <div>Reports Page</div>,
      },
      {
        path: "settings",
        element: <div>Settings Page</div>,
      },
    ],
  },
  // Teacher Routes
  {
    path: "/teacher",
    element: (
      <ProtectedRoute allowedRoles={["Teacher"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <TeacherDashboard />,
      },
      {
        path: "students",
        element: <div>Students Page</div>,
      },
      {
        path: "subjects",
        element: <div>Subjects Page</div>,
      },
      {
        path: "attendance",
        element: <div>Attendance Page</div>,
      },
      {
        path: "reports",
        element: <div>Reports Page</div>,
      },
      {
        path: "settings",
        element: <div>Settings Page</div>,
      },
    ],
  },
  // Student Routes
  {
    path: "/student",
    element: (
      <ProtectedRoute allowedRoles={["Student"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <StudentDashboard />,
      },
      {
        path: "attendance",
        element: <div>My Attendance Page</div>,
      },
      {
        path: "settings",
        element: <div>Settings Page</div>,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
