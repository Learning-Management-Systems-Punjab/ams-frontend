import React, { useState, useEffect } from "react";
import teacherPortalService, {
  type StudentAttendanceStats,
  type SectionAttendanceStats,
} from "../../services/teacherPortal.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";
import { useSearchParams } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Student Stats View Component
interface StudentStatsViewProps {
  stats: StudentAttendanceStats;
  onClose: () => void;
}

const StudentStatsView: React.FC<StudentStatsViewProps> = ({
  stats,
  onClose,
}) => {
  const attendanceData = [
    { name: "Present", value: stats.stats.present, color: "#10b981" },
    { name: "Absent", value: stats.stats.absent, color: "#ef4444" },
    { name: "Late", value: stats.stats.late, color: "#f59e0b" },
    { name: "Leave", value: stats.stats.leave, color: "#3b82f6" },
    { name: "Excused", value: stats.stats.excused, color: "#8b5cf6" },
  ];

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-100";
    if (percentage >= 75) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {stats.student.name}
            </h2>
            <p className="text-sm text-gray-600">
              Roll: {stats.student.rollNumber} • {stats.student.program} •{" "}
              {stats.student.section}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Overall Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.stats.totalClasses}
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Present</p>
              <p className="text-3xl font-bold text-green-700">
                {stats.stats.present}
              </p>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 mb-1">Absent</p>
              <p className="text-3xl font-bold text-red-700">
                {stats.stats.absent}
              </p>
            </div>

            <div
              className={`rounded-lg p-4 border-2 ${getPercentageColor(
                stats.stats.attendancePercentage,
              )}`}
            >
              <p className="text-sm mb-1">Attendance %</p>
              <p className="text-3xl font-bold">
                {stats.stats.attendancePercentage.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Attendance Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Detailed Breakdown
              </h3>
              <div className="space-y-3">
                {attendanceData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {item.value}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        (
                        {(
                          (item.value / stats.stats.totalClasses) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              Statistics Period:{" "}
              {new Date(stats.dateRange.startDate).toLocaleDateString()} to{" "}
              {new Date(stats.dateRange.endDate).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Statistics Page
const TeacherStatisticsPage: React.FC = () => {
  const { success, error, toasts, removeToast } = useToast();
  const [searchParams] = useSearchParams();
  const [viewType, setViewType] = useState<"student" | "section">("section");
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSection, setSelectedSection] = useState(
    searchParams.get("section") || "",
  );
  const [selectedSubject, setSelectedSubject] = useState(
    searchParams.get("subject") || "",
  );
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [studentStats, setStudentStats] =
    useState<StudentAttendanceStats | null>(null);
  const [sectionStats, setSectionStats] =
    useState<SectionAttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchSectionStudents();
    }
  }, [selectedSection]);

  const fetchInitialData = async () => {
    try {
      const [sectionsRes, subjectsRes] = await Promise.all([
        teacherPortalService.getMySections(),
        teacherPortalService.getMySubjects(),
      ]);
      setSections(sectionsRes.sections);
      setSubjects(subjectsRes.subjects);
    } catch (err: any) {
      error("Failed to load data");
    }
  };

  const fetchSectionStudents = async () => {
    try {
      const response = await teacherPortalService.getSectionStudents(
        selectedSection,
        {
          page: 1,
          limit: 500,
        },
      );
      setStudents(response.students);
    } catch (err: any) {
      // Silently fail - user may not have permission yet
    }
  };

  const handleGenerateStudentStats = async () => {
    if (!selectedStudent) {
      error("Please select a student");
      return;
    }

    setLoading(true);
    try {
      const stats = await teacherPortalService.getStudentStats(
        selectedStudent,
        {
          subjectId: selectedSubject || undefined,
          startDate,
          endDate,
        },
      );
      setStudentStats(stats);
      setShowStats(true);
      success("Statistics generated successfully!");
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to generate statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSectionStats = async () => {
    if (!selectedSection || !selectedSubject) {
      error("Please select section and subject");
      return;
    }

    setLoading(true);
    try {
      const stats = await teacherPortalService.getSectionStats(
        selectedSection,
        selectedSubject,
        startDate,
        endDate,
      );
      setSectionStats(stats);
      setShowStats(true);
      success("Statistics generated successfully!");
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to generate statistics");
    } finally {
      setLoading(false);
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Statistics 📊
          </h1>
          <p className="text-gray-600 mt-1">
            View detailed attendance reports and analytics
          </p>
        </div>
      </div>

      {/* View Type Selector */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setViewType("section");
                setShowStats(false);
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                viewType === "section"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Section Statistics
            </button>

            <button
              onClick={() => {
                setViewType("student");
                setShowStats(false);
              }}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                viewType === "student"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Student Statistics
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {!showStats && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select Filters
            </h2>

            {viewType === "section" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Section</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.name} - {section.year} ({section.shift})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Section</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.name} - {section.program?.name || "N/A"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    disabled={!selectedSection}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject (Optional)
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
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
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={
                viewType === "student"
                  ? handleGenerateStudentStats
                  : handleGenerateSectionStats
              }
              disabled={loading}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Statistics...
                </>
              ) : (
                "Generate Statistics"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Section Statistics View */}
      {showStats && viewType === "section" && sectionStats && (
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setShowStats(false)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Filters
            </button>
          </div>

          {/* Section Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {sectionStats.section.name} - {sectionStats.subject.name}
            </h2>
            <p className="text-gray-600">
              {sectionStats.section.year} • {sectionStats.section.shift} •{" "}
              {new Date(sectionStats.dateRange.startDate).toLocaleDateString()}{" "}
              to {new Date(sectionStats.dateRange.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-4xl font-bold text-gray-900">
                {sectionStats.overallStats.totalStudents}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600 mb-1">Total Classes</p>
              <p className="text-4xl font-bold text-gray-900">
                {sectionStats.overallStats.totalClasses}
              </p>
            </div>

            <div
              className={`rounded-lg shadow-sm p-6 ${getPercentageColor(
                sectionStats.overallStats.averageAttendance,
              )}`}
            >
              <p className="text-sm mb-1">Average Attendance</p>
              <p className="text-4xl font-bold">
                {sectionStats.overallStats.averageAttendance.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Student-wise Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Student-wise Attendance
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Late
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Excused
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sectionStats.studentStats.map((student, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {student.student.rollNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {student.totalClasses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                        {student.present}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-medium">
                        {student.absent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-yellow-600">
                        {student.late}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-blue-600">
                        {student.leave}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-purple-600">
                        {student.excused}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPercentageColor(
                            student.attendancePercentage,
                          )}`}
                        >
                          {student.attendancePercentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Student Statistics Modal */}
      {showStats && viewType === "student" && studentStats && (
        <StudentStatsView
          stats={studentStats}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
};

export default TeacherStatisticsPage;
