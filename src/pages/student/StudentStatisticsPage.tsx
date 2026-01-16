import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import studentPortalService from "../../services/studentPortal.service";
import type {
  AttendanceSummary,
  SectionDetails,
} from "../../services/studentPortal.service";
import { useToast } from "../../hooks/useToast";

const STATUS_COLORS = {
  Present: "#10b981",
  Absent: "#ef4444",
  Late: "#f59e0b",
  Leave: "#3b82f6",
  Excused: "#8b5cf6",
};

export const StudentStatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [section, setSection] = useState<SectionDetails | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryData, sectionData] = await Promise.all([
        studentPortalService.getMyAttendanceSummary(),
        studentPortalService.getMySectionDetails(),
      ]);
      setSummary(summaryData);
      setSection(sectionData);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to load statistics",
        "error"
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

  if (!summary || !section) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load statistics</p>
        </div>
      </div>
    );
  }

  const overallStats = summary.overallStats;
  const selectedStats = selectedSubject
    ? summary.subjectWiseStats.find((s) => s.subject._id === selectedSubject)
        ?.stats || overallStats
    : overallStats;

  // Prepare chart data
  const chartData = [
    {
      name: "Present",
      value: selectedStats.present,
      color: STATUS_COLORS.Present,
    },
    {
      name: "Absent",
      value: selectedStats.absent,
      color: STATUS_COLORS.Absent,
    },
    { name: "Late", value: selectedStats.late, color: STATUS_COLORS.Late },
    { name: "Leave", value: selectedStats.leave, color: STATUS_COLORS.Leave },
    {
      name: "Excused",
      value: selectedStats.excused,
      color: STATUS_COLORS.Excused,
    },
  ].filter((item) => item.value > 0);

  const percentageColor = studentPortalService.getPercentageColor(
    selectedStats.attendancePercentage
  );
  const statusBadge = studentPortalService.getStatusBadge(
    selectedStats.attendancePercentage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/student/dashboard")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Attendance Statistics
          </h1>
          <p className="text-gray-600 mt-1">
            Detailed analysis of your attendance performance
          </p>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          View Statistics For
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Overall (All Subjects)</option>
          {summary.subjectWiseStats.map((item) => (
            <option key={item.subject._id} value={item.subject._id}>
              {item.subject.name} ({item.subject.code})
            </option>
          ))}
        </select>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Classes"
          value={selectedStats.totalClasses.toString()}
          icon={<Calendar className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Attendance Rate"
          value={`${selectedStats.attendancePercentage.toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color={
            selectedStats.attendancePercentage >= 85
              ? "bg-green-500"
              : selectedStats.attendancePercentage >= 75
              ? "bg-orange-500"
              : "bg-red-500"
          }
          badge={statusBadge.text}
        />
        <StatCard
          title="Present"
          value={selectedStats.present.toString()}
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Absent"
          value={selectedStats.absent.toString()}
          icon={<XCircle className="w-6 h-6" />}
          color="bg-red-500"
        />
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Status Distribution
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${percent ? (percent * 100).toFixed(1) : "0.0"}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Breakdown
          </h2>
          <div className="space-y-4">
            <StatusBreakdownItem
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Present"
              count={selectedStats.present}
              total={selectedStats.totalClasses}
              color="bg-green-500"
            />
            <StatusBreakdownItem
              icon={<XCircle className="w-5 h-5 text-red-600" />}
              label="Absent"
              count={selectedStats.absent}
              total={selectedStats.totalClasses}
              color="bg-red-500"
            />
            <StatusBreakdownItem
              icon={<Clock className="w-5 h-5 text-yellow-600" />}
              label="Late"
              count={selectedStats.late}
              total={selectedStats.totalClasses}
              color="bg-yellow-500"
            />
            <StatusBreakdownItem
              icon={<FileText className="w-5 h-5 text-blue-600" />}
              label="Leave"
              count={selectedStats.leave}
              total={selectedStats.totalClasses}
              color="bg-blue-500"
            />
            <StatusBreakdownItem
              icon={<FileText className="w-5 h-5 text-purple-600" />}
              label="Excused"
              count={selectedStats.excused}
              total={selectedStats.totalClasses}
              color="bg-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Subject-wise Comparison */}
      {!selectedSubject && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Subject-wise Comparison
          </h2>
          <div className="space-y-4">
            {summary.subjectWiseStats.map((item) => {
              const percentage = item.stats.attendancePercentage;
              const color = studentPortalService.getPercentageColor(percentage);
              return (
                <div
                  key={item.subject._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.subject.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.subject.code}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${color}`}>
                        {percentage.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.stats.present}/{item.stats.totalClasses}
                      </p>
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
                  <div className="grid grid-cols-4 gap-2 mt-3 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">Present</p>
                      <p className="font-semibold text-green-600">
                        {item.stats.present}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Absent</p>
                      <p className="font-semibold text-red-600">
                        {item.stats.absent}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Late</p>
                      <p className="font-semibold text-yellow-600">
                        {item.stats.late}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Leave</p>
                      <p className="font-semibold text-blue-600">
                        {item.stats.leave}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Indicator */}
      <div
        className={`rounded-xl p-6 border-2 ${
          selectedStats.attendancePercentage >= 85
            ? "bg-green-50 border-green-200"
            : selectedStats.attendancePercentage >= 75
            ? "bg-orange-50 border-orange-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-lg ${
              selectedStats.attendancePercentage >= 85
                ? "bg-green-100 text-green-600"
                : selectedStats.attendancePercentage >= 75
                ? "bg-orange-100 text-orange-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {selectedStats.attendancePercentage >= 85
                ? "Excellent Performance! 🎉"
                : selectedStats.attendancePercentage >= 75
                ? "Good Performance! 👍"
                : "Needs Improvement ⚠️"}
            </h3>
            <p className="text-gray-700">
              {selectedStats.attendancePercentage >= 85
                ? "Keep up the great work! Your attendance is outstanding."
                : selectedStats.attendancePercentage >= 75
                ? "You're doing well, but there's room for improvement to reach excellent status."
                : "Your attendance is below the recommended threshold. Please try to attend more classes."}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className={`font-semibold ${percentageColor}`}>
                Current: {selectedStats.attendancePercentage.toFixed(1)}%
              </div>
              {selectedStats.attendancePercentage < 85 && (
                <div className="text-gray-600">
                  Target: 85% (Need{" "}
                  {Math.ceil(
                    (0.85 * selectedStats.totalClasses -
                      selectedStats.present) /
                      0.15
                  )}{" "}
                  more present days)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  badge,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
        {badge && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

interface StatusBreakdownItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
  color: string;
}

const StatusBreakdownItem: React.FC<StatusBreakdownItemProps> = ({
  icon,
  label,
  count,
  total,
  color,
}) => {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {count} / {total}
        </span>
        <span className="text-sm font-semibold text-gray-900 min-w-[50px] text-right">
          {percentage}%
        </span>
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
