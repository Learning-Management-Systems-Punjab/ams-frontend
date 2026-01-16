import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ArrowLeft,
  Save,
  Search,
} from "lucide-react";
import teacherPortalService, {
  type AttendanceSheetStudent,
  type MarkAttendanceDto,
} from "../../services/teacherPortal.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";
import { useNavigate, useSearchParams } from "react-router-dom";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave" | "Excused";

interface StudentAttendance extends AttendanceSheetStudent {
  status: AttendanceStatus;
  remarks: string;
}

const TeacherMarkAttendancePage: React.FC = () => {
  const { success, error, toasts, removeToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState(
    searchParams.get("section") || ""
  );
  const [selectedSubject, setSelectedSubject] = useState(
    searchParams.get("subject") || ""
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [period, setPeriod] = useState("");
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheetGenerated, setSheetGenerated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

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

  const handleGenerateSheet = async () => {
    if (!selectedSection || !selectedSubject || !selectedDate) {
      error("Please select section, subject, and date");
      return;
    }

    setLoading(true);
    try {
      const response = await teacherPortalService.generateAttendanceSheet(
        selectedSection,
        selectedSubject,
        selectedDate
      );

      const studentsWithStatus: StudentAttendance[] = response.students.map(
        (student) => ({
          ...student,
          status: "Present" as AttendanceStatus,
          remarks: "",
        })
      );

      setStudents(studentsWithStatus);
      setSheetGenerated(true);
      setAlreadyMarked(response.alreadyMarked);

      if (response.alreadyMarked) {
        error("⚠️ Attendance already marked for this date and period!");
      } else {
        success("Attendance sheet generated successfully!");
      }
    } catch (err: any) {
      error(
        err?.response?.data?.message || "Failed to generate attendance sheet"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, status } : s))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, remarks } : s))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    success(`Marked all students as ${status}`);
  };

  const handleSubmit = async () => {
    if (!period) {
      error("Please enter the period number");
      return;
    }

    setSubmitting(true);
    try {
      const data: MarkAttendanceDto = {
        sectionId: selectedSection,
        subjectId: selectedSubject,
        date: selectedDate,
        period,
        attendanceRecords: students.map((s) => ({
          studentId: s._id,
          status: s.status,
          remarks: s.remarks || undefined,
        })),
      };

      await teacherPortalService.markAttendance(data);
      success("✅ Attendance marked successfully!");

      setTimeout(() => {
        navigate("/teacher/attendance-records");
      }, 2000);
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 border-green-300";
      case "Absent":
        return "bg-red-100 text-red-800 border-red-300";
      case "Late":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Leave":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Excused":
        return "bg-purple-100 text-purple-800 border-purple-300";
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return <CheckCircle2 className="w-4 h-4" />;
      case "Absent":
        return <XCircle className="w-4 h-4" />;
      case "Late":
        return <Clock className="w-4 h-4" />;
      case "Leave":
        return <FileText className="w-4 h-4" />;
      case "Excused":
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusCounts = {
    Present: students.filter((s) => s.status === "Present").length,
    Absent: students.filter((s) => s.status === "Absent").length,
    Late: students.filter((s) => s.status === "Late").length,
    Leave: students.filter((s) => s.status === "Leave").length,
    Excused: students.filter((s) => s.status === "Excused").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mark Attendance ✓
            </h1>
            <p className="text-gray-600 mt-1">
              Take attendance for your assigned classes
            </p>
          </div>
        </div>
      </div>

      {/* Selection Form */}
      {!sheetGenerated && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select Class Details
            </h2>

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
                      {section.name} - {section.program.name} ({section.year}{" "}
                      Year)
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
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateSheet}
                  disabled={
                    loading ||
                    !selectedSection ||
                    !selectedSubject ||
                    !selectedDate
                  }
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Generate Sheet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Sheet */}
      {sheetGenerated && (
        <>
          {/* Period Input & Summary */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="e.g., 1, 2, 3..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quick Actions
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkAll("Present")}
                      className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => handleMarkAll("Absent")}
                      className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
                    >
                      Mark All Absent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className={`rounded-lg p-4 border-2 ${getStatusColor(
                    status as AttendanceStatus
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{status}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    {getStatusIcon(status as AttendanceStatus)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or roll number..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Students ({filteredStudents.length})
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <div
                    key={student._id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      student.status !== "Present" ? "bg-red-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Student Info */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Roll: {student.rollNumber}
                        </p>
                      </div>

                      {/* Status Buttons */}
                      <div className="flex gap-2">
                        {(
                          [
                            "Present",
                            "Absent",
                            "Late",
                            "Leave",
                            "Excused",
                          ] as AttendanceStatus[]
                        ).map((status) => (
                          <button
                            key={status}
                            onClick={() =>
                              handleStatusChange(student._id, status)
                            }
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              student.status === status
                                ? getStatusColor(status) + " border-2"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            title={status}
                          >
                            {status.charAt(0)}
                          </button>
                        ))}
                      </div>

                      {/* Remarks */}
                      <div className="w-64">
                        <input
                          type="text"
                          value={student.remarks}
                          onChange={(e) =>
                            handleRemarksChange(student._id, e.target.value)
                          }
                          placeholder="Remarks (optional)"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={handleSubmit}
                disabled={submitting || !period || alreadyMarked}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit Attendance
                  </>
                )}
              </button>

              {alreadyMarked && (
                <p className="mt-3 text-center text-sm text-red-600">
                  ⚠️ Attendance already marked for this date and period. This
                  will overwrite existing data.
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Help Section */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📖 Instructions:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              • Select your section, subject, and date to generate attendance
              sheet
            </li>
            <li>• All students are marked "Present" by default</li>
            <li>
              • Click status buttons: P (Present), A (Absent), L (Late), V
              (Leave), E (Excused)
            </li>
            <li>
              • Use "Mark All Present" or "Mark All Absent" for quick actions
            </li>
            <li>• Add remarks for specific students if needed</li>
            <li>• Enter the period number before submitting</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeacherMarkAttendancePage;
