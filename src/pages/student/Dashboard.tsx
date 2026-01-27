import React, { useEffect, useState } from "react";
import {
  Calendar,
  BookOpen,
  CheckCircle,
  TrendingUp,
  User,
  GraduationCap,
  Building2,
  Users,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import studentPortalService from "../../services/studentPortal.service";
import type {
  StudentProfile,
  AttendanceSummary,
} from "../../services/studentPortal.service";
import { useToast } from "../../hooks/useToast";

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileData, summaryData] = await Promise.all([
        studentPortalService.getMyProfile(),
        studentPortalService.getMyAttendanceSummary(),
      ]);
      setProfile(profileData);
      setSummary(summaryData);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to load dashboard data",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile || !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  // Check if student is not assigned to a section or no attendance data
  if (
    !summary.overall ||
    summary.overall.totalClasses === undefined ||
    !profile.section
  ) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-gray-600 mt-1">
            Track your attendance and academic progress
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-800 font-medium">
              Not Assigned to a Section
            </p>
            <p className="text-gray-600 mt-2">
              You haven't been assigned to any section yet or no attendance has
              been recorded. Please contact your college administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const overallPercentage = summary.overall.attendancePercentage || 0;
  const statusBadge = studentPortalService.getStatusBadge(overallPercentage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile.firstName} {profile.lastName}
        </h1>
        <p className="text-gray-600 mt-1">
          Track your attendance and academic progress
        </p>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-blue-100">Roll No: {profile.rollNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-200" />
                <div>
                  <p className="text-xs text-blue-200">Program</p>
                  <p className="font-semibold">
                    {profile.section?.program?.name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-200" />
                <div>
                  <p className="text-xs text-blue-200">College</p>
                  <p className="font-semibold">
                    {profile.section?.college?.name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-200" />
                <div>
                  <p className="text-xs text-blue-200">Section</p>
                  <p className="font-semibold">
                    {profile.section?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusBadge.color}`}
            >
              {statusBadge.text}
            </div>
            <p className="text-3xl font-bold mt-2">
              {overallPercentage.toFixed(1)}%
            </p>
            <p className="text-blue-100 text-sm">Overall Attendance</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Classes"
          value={(summary.overall?.totalClasses || 0).toString()}
          subtitle={`${summary.overall?.present || 0} Present`}
          icon={<Calendar className="w-6 h-6" />}
          color="bg-blue-500"
          trend={`${overallPercentage.toFixed(1)}%`}
        />
        <StatCard
          title="Subjects Enrolled"
          value={(summary.subjects?.length || 0).toString()}
          subtitle={`${profile.section?.semester || "N/A"}`}
          icon={<BookOpen className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Present Days"
          value={(summary.overall?.present || 0).toString()}
          subtitle={`${summary.overall?.late || 0} Late Arrivals`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-emerald-500"
        />
        <StatCard
          title="Absent Days"
          value={(summary.overall?.absent || 0).toString()}
          subtitle={`${summary.overall?.excused || 0} Excused`}
          icon={<Clock className="w-6 h-6" />}
          color="bg-red-500"
        />
      </div>

      {/* Subject-wise Attendance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Subject-wise Attendance
          </h2>
          <button
            onClick={() => navigate("/student/attendance")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.subjects?.map((item) => {
            const percentage = item.attendancePercentage ?? 0;
            const percentageColor =
              studentPortalService.getPercentageColor(percentage);
            return (
              <div
                key={item.subject?._id || Math.random()}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.subject?.name || "Unknown Subject"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.subject?.code || "N/A"}
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${percentageColor}`}>
                    {percentage.toFixed(0)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Present:</span>
                    <span className="font-medium text-green-600">
                      {item.present ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Absent:</span>
                    <span className="font-medium text-red-600">
                      {item.absent ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-gray-900">
                      {item.totalClasses ?? 0}
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      percentage >= 85
                        ? "bg-green-500"
                        : percentage >= 75
                          ? "bg-orange-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickActionButton
            icon={<BookOpen className="w-5 h-5" />}
            label="My Section"
            onClick={() => navigate("/student/section")}
          />
          <QuickActionButton
            icon={<Calendar className="w-5 h-5" />}
            label="Attendance Records"
            onClick={() => navigate("/student/attendance")}
          />
          <QuickActionButton
            icon={<TrendingUp className="w-5 h-5" />}
            label="Statistics"
            onClick={() => navigate("/student/statistics")}
          />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
        {trend && (
          <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
    >
      <div className="text-blue-600">{icon}</div>
      <span className="font-medium text-gray-900">{label}</span>
    </button>
  );
};
