import React, { useState, useEffect } from "react";
import collegeAdminAttendanceService from "../../services/collegeAdminAttendance.service";
import collegeAdminSectionManagementService from "../../services/collegeAdminSectionManagement.service";
import collegeAdminSubjectService from "../../services/collegeAdminSubject.service";
import type {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSheet,
} from "../../services/collegeAdminAttendance.service";
import type { Section } from "../../services/collegeAdminSectionManagement.service";
import type { Subject } from "../../services/collegeAdminSubject.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";

// ==================== Status Button Component ====================

interface StatusButtonProps {
  status: AttendanceStatus;
  label: string;
  color: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}

const StatusButton: React.FC<StatusButtonProps> = ({
  status,
  label,
  color,
  icon,
  isSelected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
        isSelected
          ? `${color} ring-2 ring-offset-2`
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

// ==================== Student Row Component ====================

interface StudentRowProps {
  student: {
    _id: string;
    name: string;
    rollNumber: string;
    fatherName?: string;
  };
  status: AttendanceStatus;
  remarks: string;
  onStatusChange: (status: AttendanceStatus) => void;
  onRemarksChange: (remarks: string) => void;
}

const StudentRow: React.FC<StudentRowProps> = ({
  student,
  status,
  remarks,
  onStatusChange,
  onRemarksChange,
}) => {
  const statusConfig: Record<
    AttendanceStatus,
    { color: string; bgColor: string; icon: string }
  > = {
    Present: { color: "text-green-700", bgColor: "bg-green-100", icon: "✓" },
    Absent: { color: "text-red-700", bgColor: "bg-red-100", icon: "✗" },
    Late: { color: "text-yellow-700", bgColor: "bg-yellow-100", icon: "⏰" },
    Leave: { color: "text-blue-700", bgColor: "bg-blue-100", icon: "📋" },
    Excused: { color: "text-purple-700", bgColor: "bg-purple-100", icon: "✓" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}
          >
            <span className={`text-lg ${config.color}`}>{config.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {student.name}
            </p>
            <p className="text-xs text-gray-500">
              Roll: {student.rollNumber}
              {student.fatherName && ` • Father: ${student.fatherName}`}
            </p>
          </div>
        </div>
      </div>

      {/* Status Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onStatusChange("Present")}
          className={`px-3 py-1 rounded text-xs font-medium ${
            status === "Present"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title="Present (P)"
        >
          ✓ P
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("Absent")}
          className={`px-3 py-1 rounded text-xs font-medium ${
            status === "Absent"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title="Absent (A)"
        >
          ✗ A
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("Late")}
          className={`px-3 py-1 rounded text-xs font-medium ${
            status === "Late"
              ? "bg-yellow-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title="Late (L)"
        >
          ⏰ L
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("Leave")}
          className={`px-3 py-1 rounded text-xs font-medium ${
            status === "Leave"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title="Leave (V)"
        >
          📋 V
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("Excused")}
          className={`px-3 py-1 rounded text-xs font-medium ${
            status === "Excused"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title="Excused (E)"
        >
          ✓ E
        </button>
      </div>

      {/* Remarks */}
      <div className="w-48">
        <input
          type="text"
          value={remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          placeholder="Remarks..."
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

// ==================== Main Mark Attendance Page ====================

const MarkAttendancePage: React.FC = () => {
  const { success, error, toasts, removeToast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [period, setPeriod] = useState(1);
  const [attendanceSheet, setAttendanceSheet] =
    useState<AttendanceSheet | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Map<string, { status: AttendanceStatus; remarks: string }>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "p":
            e.preventDefault();
            markAll("Present");
            break;
          case "a":
            e.preventDefault();
            markAll("Absent");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [attendanceSheet]);

  const fetchInitialData = async () => {
    try {
      const [sectionsRes, subjectsRes] = await Promise.all([
        collegeAdminSectionManagementService.getAll({ page: 1, limit: 200 }),
        collegeAdminSubjectService.getAll(1, 100),
      ]);
      setSections(sectionsRes.sections);
      setSubjects(subjectsRes.subjects);
    } catch (err: any) {
      error("Failed to load data");
    }
  };

  const handleGenerateSheet = async () => {
    if (!selectedSection || !selectedSubject) {
      error("Please select section and subject");
      return;
    }

    setLoading(true);
    try {
      const sheet = await collegeAdminAttendanceService.generateSheet(
        selectedSection,
        selectedSubject
      );
      setAttendanceSheet(sheet);

      // Initialize all students as Present
      const initialRecords = new Map();
      sheet.students.forEach((student) => {
        initialRecords.set(student._id, {
          status: "Present" as AttendanceStatus,
          remarks: "",
        });
      });
      setAttendanceRecords(initialRecords);

      success("Attendance sheet generated successfully!");
    } catch (err: any) {
      error(
        err?.response?.data?.message || "Failed to generate attendance sheet"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
    const updated = new Map(attendanceRecords);
    const current = updated.get(studentId) || {
      status: "Present",
      remarks: "",
    };
    updated.set(studentId, { ...current, status });
    setAttendanceRecords(updated);
  };

  const updateStudentRemarks = (studentId: string, remarks: string) => {
    const updated = new Map(attendanceRecords);
    const current = updated.get(studentId) || {
      status: "Present",
      remarks: "",
    };
    updated.set(studentId, { ...current, remarks });
    setAttendanceRecords(updated);
  };

  const markAll = (status: AttendanceStatus) => {
    if (!attendanceSheet) return;

    const updated = new Map(attendanceRecords);
    attendanceSheet.students.forEach((student) => {
      const current = updated.get(student._id) || {
        status: "Present",
        remarks: "",
      };
      updated.set(student._id, { ...current, status });
    });
    setAttendanceRecords(updated);
    success(`Marked all students as ${status}`);
  };

  const handleSubmit = async () => {
    if (!selectedSection || !selectedSubject || !attendanceSheet) {
      error("Please generate attendance sheet first");
      return;
    }

    if (attendanceRecords.size === 0) {
      error("No attendance records to submit");
      return;
    }

    setSubmitting(true);
    try {
      const records: AttendanceRecord[] = Array.from(
        attendanceRecords.entries()
      ).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks,
      }));

      const result = await collegeAdminAttendanceService.markAttendance({
        sectionId: selectedSection,
        subjectId: selectedSubject,
        date,
        period,
        attendanceRecords: records,
      });

      setSuccessData(result);
      setShowSuccess(true);
      success("Attendance marked successfully!");

      // Reset form
      setAttendanceSheet(null);
      setAttendanceRecords(new Map());
      setSelectedSection("");
      setSelectedSubject("");
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusCount = (status: AttendanceStatus): number => {
    return Array.from(attendanceRecords.values()).filter(
      (r) => r.status === status
    ).length;
  };

  if (showSuccess && successData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Attendance Marked Successfully! ✓
              </h2>
              <p className="text-gray-600">
                {successData.successfulRecords} out of{" "}
                {successData.totalRecords} records saved
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-900">
                    {successData.date}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="font-medium text-gray-900">
                    {successData.period}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Section</p>
                  <p className="font-medium text-gray-900">
                    {sections.find((s) => s._id === successData.sectionId)
                      ?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subject</p>
                  <p className="font-medium text-gray-900">
                    {subjects.find((s) => s._id === successData.subjectId)
                      ?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccess(false);
                setSuccessData(null);
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Mark Another Attendance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mark Attendance ⭐
          </h1>
          <p className="text-gray-600 mt-1">
            Mark attendance for entire section at once
          </p>
        </div>
      </div>

      {/* Selection Form */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!!attendanceSheet}
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
                disabled={!!attendanceSheet}
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!!attendanceSheet}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!!attendanceSheet}
              />
            </div>
          </div>

          {!attendanceSheet ? (
            <button
              onClick={handleGenerateSheet}
              disabled={loading || !selectedSection || !selectedSubject}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Sheet...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Generate Attendance Sheet
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => {
                setAttendanceSheet(null);
                setAttendanceRecords(new Map());
              }}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Change Selection
            </button>
          )}
        </div>
      </div>

      {/* Attendance Sheet */}
      {attendanceSheet && (
        <>
          {/* Quick Actions */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {attendanceSheet.section.name} -{" "}
                    {attendanceSheet.subject.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {attendanceSheet.totalStudents} students • {date} • Period{" "}
                    {period}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => markAll("Present")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    Mark All Present (Ctrl+P)
                  </button>
                  <button
                    type="button"
                    onClick={() => markAll("Absent")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Mark All Absent (Ctrl+A)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg">✓</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getStatusCount("Present")}
                    </p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-lg">✗</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getStatusCount("Absent")}
                    </p>
                    <p className="text-sm text-gray-600">Absent</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-lg">⏰</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getStatusCount("Late")}
                    </p>
                    <p className="text-sm text-gray-600">Late</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📋</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getStatusCount("Leave")}
                    </p>
                    <p className="text-sm text-gray-600">Leave</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-lg">✓</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getStatusCount("Excused")}
                    </p>
                    <p className="text-sm text-gray-600">Excused</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="space-y-2">
              {attendanceSheet.students.map((student) => {
                const record = attendanceRecords.get(student._id) || {
                  status: "Present" as AttendanceStatus,
                  remarks: "",
                };
                return (
                  <StudentRow
                    key={student._id}
                    student={student}
                    status={record.status}
                    remarks={record.remarks}
                    onStatusChange={(status) =>
                      updateStudentStatus(student._id, status)
                    }
                    onRemarksChange={(remarks) =>
                      updateStudentRemarks(student._id, remarks)
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Ready to Submit?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Please review all attendance records before submitting
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {attendanceRecords.size}
                  </p>
                  <p className="text-sm text-gray-600">Total Records</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || attendanceRecords.size === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting Attendance...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Submit Attendance
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Help Section */}
      {!attendanceSheet && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              💡 How to Mark Attendance:
            </h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. Select the section, subject, date, and period</li>
              <li>2. Click "Generate Attendance Sheet" to load all students</li>
              <li>3. All students are marked as "Present" by default</li>
              <li>
                4. Click status buttons to change individual student status
              </li>
              <li>5. Add remarks if needed (optional)</li>
              <li>6. Review the summary and click "Submit Attendance"</li>
            </ol>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Keyboard Shortcuts:
              </p>
              <div className="flex gap-4 text-xs text-blue-800">
                <span>• Ctrl+P: Mark All Present</span>
                <span>• Ctrl+A: Mark All Absent</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;
