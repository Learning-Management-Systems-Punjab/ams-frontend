import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  BookOpen,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import teacherPortalService, {
  type AttendanceRecord,
} from "../../services/teacherPortal.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";

const AttendanceRecordsPage: React.FC = () => {
  const { toasts, removeToast, error } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    sectionId: "",
    subjectId: "",
    date: "",
    startDate: "",
    endDate: "",
    period: "",
    search: "",
  });

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [
    page,
    filters.sectionId,
    filters.subjectId,
    filters.date,
    filters.startDate,
    filters.endDate,
    filters.period,
  ]);

  const fetchInitialData = async () => {
    try {
      const [sectionsRes, subjectsRes] = await Promise.all([
        teacherPortalService.getMySections(),
        teacherPortalService.getMySubjects(),
      ]);
      setSections(sectionsRes.sections);
      setSubjects(subjectsRes.subjects);
    } catch (err: any) {
      error("Failed to load initial data");
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getAttendance({
        page,
        limit: ITEMS_PER_PAGE,
        sectionId: filters.sectionId || undefined,
        subjectId: filters.subjectId || undefined,
        date: filters.date || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        period: filters.period || undefined,
      });

      setRecords(response.attendance);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err: any) {
      error(
        err?.response?.data?.message || "Failed to load attendance records"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      sectionId: "",
      subjectId: "",
      date: "",
      startDate: "",
      endDate: "",
      period: "",
      search: "",
    });
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Present
          </span>
        );
      case "Absent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
            <XCircle className="w-3 h-3" />
            Absent
          </span>
        );
      case "Late":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            <Clock className="w-3 h-3" />
            Late
          </span>
        );
      case "Leave":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            <FileText className="w-3 h-3" />
            Leave
          </span>
        );
      case "Excused":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
            <FileText className="w-3 h-3" />
            Excused
          </span>
        );
      default:
        return null;
    }
  };

  const filteredRecords = records.filter((record) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      record.student.name.toLowerCase().includes(searchLower) ||
      record.student.rollNumber.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Attendance Records 📋
            </h1>
            <p className="text-gray-600 mt-1">
              View attendance history for your classes
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Records</p>
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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                value={filters.sectionId}
                onChange={(e) =>
                  handleFilterChange("sectionId", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.name} - {section.program.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={filters.subjectId}
                onChange={(e) =>
                  handleFilterChange("subjectId", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period
              </label>
              <input
                type="text"
                value={filters.period}
                onChange={(e) => handleFilterChange("period", e.target.value)}
                placeholder="e.g., 1, 2, 3..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search by student name or roll number..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading records...</p>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No records found
            </h3>
            <p className="text-gray-600">
              {filters.sectionId ||
              filters.subjectId ||
              filters.date ||
              filters.search
                ? "Try adjusting your filters"
                : "No attendance records available"}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Roll: {record.student.rollNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {record.section.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {record.subject.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.subject.code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {record.period}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {record.remarks || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    of <span className="font-medium">{total}</span> records
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
                            (p >= page - 1 && p <= page + 1)
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

export default AttendanceRecordsPage;
