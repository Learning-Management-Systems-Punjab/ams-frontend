import React, { useEffect, useState } from "react";
import {
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  ArrowLeft,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import studentPortalService from "../../services/studentPortal.service";
import type {
  AttendanceRecord,
  PaginatedResponse,
  AttendanceFilters,
  SectionDetails,
} from "../../services/studentPortal.service";
import { useToast } from "../../hooks/useToast";

export const AttendanceRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] =
    useState<PaginatedResponse<AttendanceRecord> | null>(null);
  const [section, setSection] = useState<SectionDetails | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    fetchSectionDetails();
  }, []);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [filters]);

  const fetchSectionDetails = async () => {
    try {
      const data = await studentPortalService.getMySectionDetails();
      setSection(data);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to load section details",
        "error"
      );
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const data = await studentPortalService.getMyAttendance(filters);
      setRecords(data);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to load attendance records",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AttendanceFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 });
  };

  const hasActiveFilters =
    filters.subject || filters.startDate || filters.endDate;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="w-4 h-4" />;
      case "Absent":
        return <XCircle className="w-4 h-4" />;
      case "Late":
        return <Clock className="w-4 h-4" />;
      case "Leave":
      case "Excused":
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

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
            Attendance Records
          </h1>
          <p className="text-gray-600 mt-1">
            View your detailed attendance history
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={filters.subject || ""}
              onChange={(e) =>
                handleFilterChange("subject", e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {section?.subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                handleFilterChange("startDate", e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                handleFilterChange("endDate", e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Records per page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Per Page
            </label>
            <select
              value={filters.limit || 20}
              onChange={(e) =>
                handleFilterChange("limit", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Records {records && `(${records.pagination.total})`}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : records && records.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marked By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.data.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {studentPortalService.formatDate(record.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Period {record.period}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.subject.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.subject.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${studentPortalService.getStatusColor(
                            record.status
                          )}`}
                        >
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.markedBy.firstName} {record.markedBy.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {record.remarks || "-"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {records.pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(records.pagination.page - 1) * records.pagination.limit +
                      1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      records.pagination.page * records.pagination.limit,
                      records.pagination.total
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {records.pagination.total}
                  </span>{" "}
                  results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handlePageChange(records.pagination.page - 1)
                    }
                    disabled={records.pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-900">
                    Page {records.pagination.page} of {records.pagination.pages}
                  </span>
                  <button
                    onClick={() =>
                      handlePageChange(records.pagination.page + 1)
                    }
                    disabled={
                      records.pagination.page === records.pagination.pages
                    }
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              No attendance records found
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
