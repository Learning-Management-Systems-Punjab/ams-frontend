import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  Building2,
  UserCheck,
  UserX,
  Percent,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Layers,
  UserCog,
} from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { StatCard } from "../../components/ui/StatCard";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";
import {
  collegeAdminStatisticsService,
  type CollegeAdminQuickStats,
  type CollegeAdminDashboardStats,
  type RecentEnrollment,
  type ProgramStatistics,
} from "../../services/collegeAdminStatistics.service";

export const CollegeAdminDashboard: React.FC = () => {
  const { profile } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [quickStats, setQuickStats] = useState<CollegeAdminQuickStats | null>(
    null,
  );
  const [dashboardStats, setDashboardStats] =
    useState<CollegeAdminDashboardStats | null>(null);
  const [programStats, setProgramStats] = useState<ProgramStatistics[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<
    RecentEnrollment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const fetchAllStatistics = async () => {
    try {
      setLoading(true);

      // Fetch quick stats and dashboard stats in parallel
      const [quick, dashboard, programs, enrollments] = await Promise.all([
        collegeAdminStatisticsService.getQuickStats().catch(() => null),
        collegeAdminStatisticsService.getDashboardStats().catch(() => null),
        collegeAdminStatisticsService.getProgramStats().catch(() => []),
        collegeAdminStatisticsService.getRecentEnrollments(5).catch(() => []),
      ]);

      setQuickStats(quick);
      setDashboardStats(dashboard);
      setProgramStats(programs || []);
      setRecentEnrollments(enrollments || []);
    } catch (err: any) {
      console.error("Error fetching statistics:", err);
      error(
        err.response?.data?.message ||
          "Failed to load dashboard statistics. Please try again.",
      );
      // Set empty/default values on error
      setProgramStats([]);
      setRecentEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const collegeName =
    profile && typeof profile === "object" && "name" in profile
      ? profile.name
      : dashboardStats?.college.name || "College";

  const collegeCode =
    profile && typeof profile === "object" && "code" in profile
      ? profile.code
      : dashboardStats?.college.code || "";

  return (
    <div className="p-4 space-y-4">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-50 rounded-lg">
              <Building2 className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {collegeName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                College Code: {collegeCode} • College Administration Dashboard
              </p>
            </div>
          </div>
          {dashboardStats && (
            <div className="text-right">
              <p className="text-sm text-gray-500">City</p>
              <p className="text-lg font-semibold text-gray-900">
                {dashboardStats.college.city}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Teachers"
          value={quickStats?.totalTeachers ?? 0}
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-500"
          isLoading={loading}
          subtitle="Teaching staff"
        />
        <StatCard
          title="Total Students"
          value={quickStats?.totalStudents ?? 0}
          icon={<GraduationCap className="w-6 h-6" />}
          color="bg-green-500"
          isLoading={loading}
          subtitle="Enrolled students"
        />
        <StatCard
          title="Programs"
          value={quickStats?.totalPrograms ?? 0}
          icon={<BookOpen className="w-6 h-6" />}
          color="bg-purple-500"
          isLoading={loading}
          subtitle="Academic programs"
        />
        <StatCard
          title="Sections"
          value={quickStats?.totalSections ?? 0}
          icon={<Calendar className="w-6 h-6" />}
          color="bg-orange-500"
          isLoading={loading}
          subtitle="Active sections"
        />
        <StatCard
          title="Subjects"
          value={quickStats?.totalSubjects ?? 0}
          icon={<BarChart3 className="w-6 h-6" />}
          color="bg-pink-500"
          isLoading={loading}
          subtitle="Total subjects"
        />
      </div>

      {/* Setup Workflow Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 text-blue-600" />
            Quick Setup Guide
          </h3>
          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
            Follow these steps to set up your college
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Step 1: Subjects */}
          <button
            onClick={() => navigate("/collegeadmin/subjects")}
            className="relative p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group text-left"
          >
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </div>
            <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-900 text-sm">
              Create Subjects
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Add courses/subjects that will be taught
            </p>
            <div className="flex items-center mt-2 text-blue-600 text-xs font-medium group-hover:translate-x-1 transition-transform">
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

          {/* Step 2: Sections */}
          <button
            onClick={() => navigate("/collegeadmin/sections")}
            className="relative p-4 bg-white rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all group text-left"
          >
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </div>
            <Layers className="w-8 h-8 text-orange-600 mb-2" />
            <h4 className="font-semibold text-gray-900 text-sm">
              Create Sections
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Create sections and assign subjects to them
            </p>
            <div className="flex items-center mt-2 text-orange-600 text-xs font-medium group-hover:translate-x-1 transition-transform">
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

          {/* Step 3: Students */}
          <button
            onClick={() => navigate("/collegeadmin/students")}
            className="relative p-4 bg-white rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all group text-left"
          >
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </div>
            <GraduationCap className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-semibold text-gray-900 text-sm">
              Add Students
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Import or add students and assign to sections
            </p>
            <div className="flex items-center mt-2 text-green-600 text-xs font-medium group-hover:translate-x-1 transition-transform">
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

          {/* Step 4: Teacher Assignments */}
          <button
            onClick={() => navigate("/collegeadmin/teacher-assignments")}
            className="relative p-4 bg-white rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group text-left"
          >
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              4
            </div>
            <UserCog className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-semibold text-gray-900 text-sm">
              Assign Teachers
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Assign teachers to subject + section pairs
            </p>
            <div className="flex items-center mt-2 text-purple-600 text-xs font-medium group-hover:translate-x-1 transition-transform">
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>

          {/* Step 5: Attendance */}
          <button
            onClick={() => navigate("/collegeadmin/attendance-statistics")}
            className="relative p-4 bg-white rounded-lg border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all group text-left"
          >
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              5
            </div>
            <UserCheck className="w-8 h-8 text-emerald-600 mb-2" />
            <h4 className="font-semibold text-gray-900 text-sm">
              Track Attendance
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Teachers mark, students view attendance
            </p>
            <div className="flex items-center mt-2 text-emerald-600 text-xs font-medium group-hover:translate-x-1 transition-transform">
              View Stats <ArrowRight className="w-3 h-3 ml-1" />
            </div>
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Follow the steps in order: Create subjects →
            Create sections (assign subjects) → Add students (assign to
            sections) → Assign teachers to subject+section → Teachers can mark
            attendance, students can view theirs.
          </p>
        </div>
      </div>

      {/* Detailed Student Statistics */}
      {dashboardStats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Students"
            value={dashboardStats.statistics?.students?.active ?? 0}
            icon={<UserCheck className="w-6 h-6" />}
            color="bg-emerald-500"
            subtitle={`${(
              dashboardStats.statistics?.students?.activePercentage ?? 0
            ).toFixed(1)}% of total`}
          />
          <StatCard
            title="Inactive Students"
            value={dashboardStats.statistics?.students?.inactive ?? 0}
            icon={<UserX className="w-6 h-6" />}
            color="bg-red-500"
            subtitle="Not currently enrolled"
          />
          <StatCard
            title="Male Students"
            value={dashboardStats.statistics?.students?.byGender?.male ?? 0}
            icon={<Users className="w-6 h-6" />}
            color="bg-blue-500"
            subtitle="Gender breakdown"
          />
          <StatCard
            title="Female Students"
            value={dashboardStats.statistics?.students?.byGender?.female ?? 0}
            icon={<Users className="w-6 h-6" />}
            color="bg-pink-500"
            subtitle="Gender breakdown"
          />
        </div>
      )}

      {/* Academic Metrics */}
      {dashboardStats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Academic Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Percent className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Avg. Students per Section
                  </span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {(
                    dashboardStats.statistics?.academics
                      ?.averageStudentsPerSection ?? 0
                  ).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Percent className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Avg. Teachers per Program
                  </span>
                </div>
                <span className="text-xl font-bold text-purple-600">
                  {(
                    dashboardStats.statistics?.academics
                      ?.averageTeachersPerProgram ?? 0
                  ).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Teacher Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              Teacher Demographics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Male Teachers</span>
                <span className="text-lg font-bold text-blue-600">
                  {dashboardStats.statistics?.teachers?.byGender?.male ?? 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      ((dashboardStats.statistics?.teachers?.byGender?.male ??
                        0) /
                        (dashboardStats.statistics?.teachers?.total || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Female Teachers</span>
                <span className="text-lg font-bold text-pink-600">
                  {dashboardStats.statistics?.teachers?.byGender?.female ?? 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-pink-500 h-2 rounded-full"
                  style={{
                    width: `${
                      ((dashboardStats.statistics?.teachers?.byGender?.female ??
                        0) /
                        (dashboardStats.statistics?.teachers?.total || 1)) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Statistics */}
      {programStats && programStats.length > 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-purple-500" />
            Program-wise Student Distribution
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sections
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {programStats.map((program) => (
                  <tr key={program.programId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {program.programName || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {program.totalStudents || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {program.activeStudents || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {program.totalSections || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Enrollments */}
      {recentEnrollments && recentEnrollments.length > 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-green-500" />
            Recent Student Enrollments
          </h3>
          <div className="space-y-3">
            {recentEnrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {enrollment.studentName || "Unknown Student"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Roll: {enrollment.rollNumber || "N/A"} •{" "}
                      {enrollment.programName || "N/A"} •{" "}
                      {enrollment.sectionName || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      enrollment.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {enrollment.status || "Unknown"}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {enrollment.enrollmentDate
                      ? new Date(enrollment.enrollmentDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
