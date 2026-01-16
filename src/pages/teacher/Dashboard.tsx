import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  Clock,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import teacherPortalService, {
  type TeacherAssignment,
} from "../../services/teacherPortal.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";
import { useNavigate } from "react-router-dom";

export const TeacherDashboard: React.FC = () => {
  const { toasts, removeToast, error } = useToast();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    uniqueSections: 0,
    uniqueSubjects: 0,
    todayClasses: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, sectionsRes, subjectsRes] = await Promise.all([
        teacherPortalService.getMyAssignments({ page: 1, limit: 100 }),
        teacherPortalService.getMySections(),
        teacherPortalService.getMySubjects(),
      ]);

      setAssignments(assignmentsRes.assignments);

      // Calculate today's classes
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const todayClasses = assignmentsRes.assignments.filter((assignment) =>
        assignment.schedule?.some((s) => s.day === today)
      ).length;

      setStats({
        totalAssignments: assignmentsRes.total,
        uniqueSections: sectionsRes.sections.length,
        uniqueSubjects: subjectsRes.subjects.length,
        todayClasses,
      });
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getTodaySchedule = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return assignments
      .filter((assignment) => assignment.schedule?.some((s) => s.day === today))
      .map((assignment) => ({
        assignment,
        schedule: assignment.schedule!.filter((s) => s.day === today),
      }))
      .sort((a, b) => {
        const timeA = a.schedule[0]?.startTime || "";
        const timeB = b.schedule[0]?.startTime || "";
        return timeA.localeCompare(timeB);
      });
  };

  const getSemesterBadgeColor = (semester: string) => {
    switch (semester) {
      case "Fall":
        return "bg-orange-100 text-orange-800";
      case "Spring":
        return "bg-green-100 text-green-800";
      case "Summer":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todaySchedule = getTodaySchedule();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Teacher Dashboard 👨‍🏫
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your teaching overview.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today's Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Assignments</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalAssignments}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unique Sections</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.uniqueSections}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unique Subjects</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.uniqueSubjects}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Classes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.todayClasses}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/teacher/my-classes")}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-500 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">My Classes</p>
                <p className="text-sm text-gray-600">View assignments</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/teacher/mark-attendance")}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-500 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-green-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Mark Attendance</p>
                <p className="text-sm text-gray-600">Take attendance</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/teacher/attendance-records")}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-500 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">View Records</p>
                <p className="text-sm text-gray-600">Attendance history</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/teacher/statistics")}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-500 transition-colors">
                <BarChart3 className="w-6 h-6 text-orange-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Statistics</p>
                <p className="text-sm text-gray-600">View analytics</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Today's Schedule
            </h2>
            <span className="text-sm text-gray-600">
              {todaySchedule.length}{" "}
              {todaySchedule.length === 1 ? "class" : "classes"} today
            </span>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                No classes scheduled for today
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Enjoy your day off! 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map(({ assignment, schedule }) =>
                schedule.map((s, idx) => (
                  <div
                    key={`${assignment._id}-${idx}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-100 p-2 rounded">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {s.startTime} - {s.endTime}
                            </p>
                            <p className="text-sm text-gray-600">
                              Period {s.period}
                            </p>
                          </div>
                        </div>

                        <div className="ml-12 space-y-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-500" />
                            <p className="text-sm font-medium text-gray-900">
                              {assignment.subject.name} (
                              {assignment.subject.code})
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <p className="text-sm text-gray-700">
                              {assignment.section.name} -{" "}
                              {assignment.section.program.name}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSemesterBadgeColor(
                                assignment.semester
                              )}`}
                            >
                              {assignment.semester} {assignment.academicYear}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/teacher/mark-attendance?section=${assignment.section._id}&subject=${assignment.subject._id}`
                          )
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        Mark Attendance
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Assignments Overview */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              My Assignments Overview
            </h2>
            <button
              onClick={() => navigate("/teacher/my-classes")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.slice(0, 6).map((assignment) => (
              <div
                key={assignment._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-blue-100 p-2 rounded">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSemesterBadgeColor(
                      assignment.semester
                    )}`}
                  >
                    {assignment.semester}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">
                  {assignment.subject.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {assignment.subject.code} • {assignment.subject.creditHours}{" "}
                  Credits
                </p>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-700">
                      {assignment.section.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-700">
                      {assignment.section.program.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-700">
                      {assignment.section.year} Year •{" "}
                      {assignment.section.shift}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/teacher/mark-attendance?section=${assignment.section._id}&subject=${assignment.subject._id}`
                    )
                  }
                  className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                >
                  Mark Attendance
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
