import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  X,
  Menu,
  UserCheck,
  BarChart3,
  Layers,
  UserCog,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import type { UserRole } from "../../types";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ["SysAdmin", "DistrictHead", "CollegeAdmin", "Teacher", "Student"],
  },
  {
    name: "Regions",
    path: "/regions",
    icon: <MapPin className="w-5 h-5" />,
    roles: ["SysAdmin"],
  },
  {
    name: "District Heads",
    path: "/district-heads",
    icon: <Users className="w-5 h-5" />,
    roles: ["SysAdmin"],
  },
  {
    name: "Colleges",
    path: "/colleges",
    icon: <Building2 className="w-5 h-5" />,
    roles: ["SysAdmin", "DistrictHead"],
  },
  {
    name: "Teachers",
    path: "/teachers",
    icon: <Users className="w-5 h-5" />,
    roles: ["SysAdmin", "DistrictHead", "CollegeAdmin"],
  },
  {
    name: "Students",
    path: "/students",
    icon: <GraduationCap className="w-5 h-5" />,
    roles: ["SysAdmin", "DistrictHead", "CollegeAdmin"],
  },
  {
    name: "My Classes",
    path: "/my-classes",
    icon: <BookOpen className="w-5 h-5" />,
    roles: ["Teacher"],
  },
  {
    name: "My Section",
    path: "/section",
    icon: <Layers className="w-5 h-5" />,
    roles: ["Student"],
  },
  {
    name: "Subjects",
    path: "/subjects",
    icon: <BookOpen className="w-5 h-5" />,
    roles: ["SysAdmin", "DistrictHead", "CollegeAdmin"],
  },
  {
    name: "Sections",
    path: "/sections",
    icon: <Layers className="w-5 h-5" />,
    roles: ["CollegeAdmin"],
  },
  {
    name: "Teacher Assignments",
    path: "/teacher-assignments",
    icon: <UserCog className="w-5 h-5" />,
    roles: ["CollegeAdmin"],
  },
  {
    name: "Mark Attendance",
    path: "/mark-attendance",
    icon: <UserCheck className="w-5 h-5" />,
    roles: ["CollegeAdmin", "Teacher"],
  },
  {
    name: "My Attendance",
    path: "/attendance",
    icon: <UserCheck className="w-5 h-5" />,
    roles: ["Student"],
  },
  {
    name: "Attendance Records",
    path: "/attendance-records",
    icon: <FileText className="w-5 h-5" />,
    roles: ["Teacher"],
  },
  {
    name: "Statistics",
    path: "/statistics",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["Teacher", "Student"],
  },
  {
    name: "Attendance Stats",
    path: "/attendance-statistics",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["CollegeAdmin"],
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <FileText className="w-5 h-5" />,
    roles: ["SysAdmin", "DistrictHead", "CollegeAdmin", "Teacher"],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <Settings className="w-5 h-5" />,
    roles: ["SysAdmin", "DistrictHead", "CollegeAdmin", "Teacher", "Student"],
  },
];

export const Sidebar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const filteredNavItems = navigationItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  const roleBasedPath = user ? `/${user.role.toLowerCase()}` : "";

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LMS</h1>
              <p className="text-xs text-gray-500">Attendance System</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={`${roleBasedPath}${item.path}`}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
