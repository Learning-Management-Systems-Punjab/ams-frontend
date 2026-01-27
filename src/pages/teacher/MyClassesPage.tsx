import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  GraduationCap,
  Clock,
  Filter,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import teacherPortalService, {
  type TeacherAssignment,
} from "../../services/teacherPortal.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";
import { useNavigate } from "react-router-dom";

const MyClassesPage: React.FC = () => {
  const { toasts, removeToast, error } = useToast();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    academicYear: "",
    semester: "",
    search: "",
  });

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchAssignments();
  }, [page, filters.academicYear, filters.semester]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getMyAssignments({
        page,
        limit: ITEMS_PER_PAGE,
        academicYear: filters.academicYear || undefined,
        semester: filters.semester || undefined,
      });

      setAssignments(response.assignments);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
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

  const getScheduleDays = (schedule?: TeacherAssignment["schedule"]) => {
    if (!schedule || schedule.length === 0) return "No schedule";
    const days = [...new Set(schedule.map((s) => s.day))];
    return days.join(", ");
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      assignment.subject.name.toLowerCase().includes(searchLower) ||
      assignment.subject.code.toLowerCase().includes(searchLower) ||
      assignment.section.name.toLowerCase().includes(searchLower) ||
      (assignment.section.program?.name || "")
        .toLowerCase()
        .includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Classes 📚</h1>
            <p className="text-gray-600 mt-1">
              View all your teaching assignments
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Assignments</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search by subject or section..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <select
                value={filters.academicYear}
                onChange={(e) =>
                  handleFilterChange("academicYear", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                value={filters.semester}
                onChange={(e) => handleFilterChange("semester", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Semesters</option>
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ academicYear: "", semester: "", search: "" });
                  setPage(1);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading assignments...</p>
            </div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No assignments found
            </h3>
            <p className="text-gray-600">
              {filters.search || filters.academicYear || filters.semester
                ? "Try adjusting your filters"
                : "You don't have any teaching assignments yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSemesterBadgeColor(
                        assignment.semester,
                      )}`}
                    >
                      {assignment.semester}
                    </span>
                  </div>

                  {/* Subject Info */}
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {assignment.subject.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {assignment.subject.code} • {assignment.subject.creditHours}{" "}
                    Credits
                  </p>

                  {/* Section Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">
                          {assignment.section.name}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-700">
                        {assignment.section.program?.name || "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-700">
                        {assignment.section.year} Year •{" "}
                        {assignment.section.shift}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-700">
                        {getScheduleDays(assignment.schedule)}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  {assignment.schedule && assignment.schedule.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Class Schedule:
                      </p>
                      <div className="space-y-1">
                        {assignment.schedule.slice(0, 3).map((s, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs text-gray-600"
                          >
                            <span className="font-medium">{s.day}</span>
                            <span>
                              {s.startTime} - {s.endTime} (P{s.period})
                            </span>
                          </div>
                        ))}
                        {assignment.schedule.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{assignment.schedule.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Academic Year */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">
                      Academic Year: {assignment.academicYear}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/teacher/mark-attendance?section=${assignment.section._id}&subject=${assignment.subject._id}`,
                        )
                      }
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      Mark Attendance
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `/teacher/statistics?section=${assignment.section._id}&subject=${assignment.subject._id}`,
                        )
                      }
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                    >
                      📊
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-medium">
                      {(page - 1) * ITEMS_PER_PAGE + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(page * ITEMS_PER_PAGE, total)}
                    </span>{" "}
                    of <span className="font-medium">{total}</span> assignments
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            (p >= page - 1 && p <= page + 1),
                        )
                        .map((p, idx, arr) => (
                          <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => setPage(p)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                page === p
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        ))}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyClassesPage;
