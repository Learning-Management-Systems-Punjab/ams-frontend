import React, { useState, useEffect } from "react";
import collegeAdminTeacherAssignmentService from "../../services/collegeAdminTeacherAssignment.service";
import { collegeAdminProgramService } from "../../services/collegeAdminProgram.service";
import collegeAdminSubjectService from "../../services/collegeAdminSubject.service";
import collegeAdminSectionManagementService from "../../services/collegeAdminSectionManagement.service";
import { collegeAdminTeacherService } from "../../services/collegeAdminTeacher.service";
import type {
  TeacherAssignment,
  CreateTeacherAssignmentDto,
} from "../../services/collegeAdminTeacherAssignment.service";
import type { Program } from "../../services/collegeAdminProgram.service";
import type { Subject } from "../../services/collegeAdminSubject.service";
import type { Section } from "../../services/collegeAdminSectionManagement.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";

// ==================== Add/Edit Assignment Modal ====================

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAssignment?: TeacherAssignment | null;
  teachers: any[];
  subjects: Subject[];
  sections: Section[];
  success: (message: string) => void;
  error: (message: string) => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editAssignment,
  teachers,
  subjects,
  sections,
  success,
  error,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTeacherAssignmentDto>({
    teacherId: "",
    subjectId: "",
    sectionId: "",
    academicYear: "2025-2026",
    semester: "Fall",
  });

  useEffect(() => {
    if (editAssignment) {
      setFormData({
        teacherId: editAssignment.teacherId,
        subjectId: editAssignment.subjectId,
        sectionId: editAssignment.sectionId,
        academicYear: editAssignment.academicYear,
        semester: editAssignment.semester as "Fall" | "Spring" | "Summer",
      });
    } else {
      setFormData({
        teacherId: "",
        subjectId: "",
        sectionId: "",
        academicYear: "2025-2026",
        semester: "Fall",
      });
    }
  }, [editAssignment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teacherId || !formData.subjectId || !formData.sectionId) {
      error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      if (editAssignment) {
        await collegeAdminTeacherAssignmentService.update(
          editAssignment._id,
          formData,
        );
        success("Assignment updated successfully!");
      } else {
        await collegeAdminTeacherAssignmentService.create(formData);
        success("Assignment created successfully!");
      }
      onClose();
      onSuccess();
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to save assignment");
    } finally {
      setLoading(false);
    }
  };

  // Debug: log data passed to modal
  console.log("AssignmentModal received:", {
    isOpen,
    teachersCount: teachers?.length || 0,
    subjectsCount: subjects?.length || 0,
    sectionsCount: sections?.length || 0,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {editAssignment ? "Edit Assignment" : "Add New Assignment"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.teacherId}
                onChange={(e) =>
                  setFormData({ ...formData, teacherId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} - {teacher.contactEmail}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.subjectId}
                onChange={(e) =>
                  setFormData({ ...formData, subjectId: e.target.value })
                }
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
                Section <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.sectionId}
                onChange={(e) =>
                  setFormData({ ...formData, sectionId: e.target.value })
                }
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData({ ...formData, academicYear: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2025-2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      semester: e.target.value as "Fall" | "Spring" | "Summer",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : editAssignment ? "Update" : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== Delete Confirmation Modal ====================

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Remove Assignment
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to remove this assignment?
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          This action cannot be undone. The teacher will no longer be assigned
          to this section.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== Main Teacher Assignment Page ====================

const TeacherAssignmentPage: React.FC = () => {
  const { success, error, toasts, removeToast } = useToast();
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editAssignment, setEditAssignment] =
    useState<TeacherAssignment | null>(null);
  const [deleteAssignment, setDeleteAssignment] =
    useState<TeacherAssignment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterAcademicYear, setFilterAcademicYear] = useState("2025-2026");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterProgram, setFilterProgram] = useState("");

  const limit = 20;

  useEffect(() => {
    console.log("TeacherAssignmentPage mounted - fetching initial data...");
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [currentPage, filterAcademicYear, filterSemester, filterProgram]);

  const fetchInitialData = async () => {
    console.log("fetchInitialData called");
    setInitialDataLoading(true);
    try {
      // Fetch all data with individual error handling
      // Note: Backend limits max to 100 per request
      const [teachersRes, subjectsRes, sectionsRes, programsRes] =
        await Promise.allSettled([
          collegeAdminTeacherService.getAll(1, 100),
          collegeAdminSubjectService.getAll(1, 100),
          collegeAdminSectionManagementService.getAll({ page: 1, limit: 100 }),
          collegeAdminProgramService.getAll(),
        ]);

      // Handle teachers
      if (teachersRes.status === "fulfilled") {
        console.log("Teachers loaded:", teachersRes.value.data?.length || 0);
        setTeachers(teachersRes.value.data || []);
      } else {
        console.error("Failed to load teachers:", teachersRes.reason);
      }

      // Handle subjects
      if (subjectsRes.status === "fulfilled") {
        console.log(
          "Subjects loaded:",
          subjectsRes.value.subjects?.length || 0,
        );
        setSubjects(subjectsRes.value.subjects || []);
      } else {
        console.error("Failed to load subjects:", subjectsRes.reason);
      }

      // Handle sections
      if (sectionsRes.status === "fulfilled") {
        console.log(
          "Sections loaded:",
          sectionsRes.value.sections?.length || 0,
        );
        setSections(sectionsRes.value.sections || []);
      } else {
        console.error("Failed to load sections:", sectionsRes.reason);
      }

      // Handle programs
      if (programsRes.status === "fulfilled") {
        console.log("Programs loaded:", programsRes.value?.length || 0);
        setPrograms(programsRes.value || []);
      } else {
        console.error("Failed to load programs:", programsRes.reason);
      }
    } catch (err: any) {
      console.error("Failed to load initial data:", err);
      error("Failed to load initial data");
    } finally {
      setInitialDataLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const filters: any = { page: currentPage, limit };
      if (filterAcademicYear) filters.academicYear = filterAcademicYear;
      if (filterSemester) filters.semester = filterSemester;
      if (filterProgram) filters.programId = filterProgram;

      const response =
        await collegeAdminTeacherAssignmentService.getAll(filters);
      setAssignments(response.assignments);
      setTotalPages(response.totalPages);
      setTotalAssignments(response.totalAssignments);
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment: TeacherAssignment) => {
    setEditAssignment(assignment);
    setShowModal(true);
  };

  const handleDeleteClick = (assignment: TeacherAssignment) => {
    setDeleteAssignment(assignment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAssignment) return;

    setDeleteLoading(true);
    try {
      await collegeAdminTeacherAssignmentService.delete(deleteAssignment._id);
      success("Assignment removed successfully!");
      setShowDeleteModal(false);
      setDeleteAssignment(null);
      fetchAssignments();
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to remove assignment");
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterAcademicYear("2025-2026");
    setFilterSemester("");
    setFilterProgram("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Workflow Tip Banner */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-purple-800">
              <strong>Step 4 of 5:</strong> Assign teachers to Subject + Section
              pairs. Once assigned, teachers can mark attendance for students in
              that section.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Teacher Assignments
            </h1>
            <p className="text-gray-600 mt-1">
              Assign teachers to sections for subjects
            </p>
          </div>
          <button
            onClick={() => {
              setEditAssignment(null);
              setShowModal(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm flex items-center gap-2"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Assignment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={filterAcademicYear}
              onChange={(e) => {
                setFilterAcademicYear(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Academic Year (e.g., 2025-2026)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={filterSemester}
              onChange={(e) => {
                setFilterSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Semesters</option>
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>

            <select
              value={filterProgram}
              onChange={(e) => {
                setFilterProgram(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.name}
                </option>
              ))}
            </select>

            {(filterSemester ||
              filterProgram ||
              filterAcademicYear !== "2025-2026") && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalAssignments}
              </p>
              <p className="text-sm text-gray-600">Total Assignments</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No assignments found
            </h3>
            <p className="text-gray-600 mb-4">
              {filterSemester || filterProgram
                ? "Try adjusting your filters"
                : "Get started by creating your first assignment"}
            </p>
            {!filterSemester && !filterProgram && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                New Assignment
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Academic Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment) => (
                      <tr key={assignment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {assignment.teacher?.name?.charAt(0) || "T"}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {assignment.teacher?.name || "Unknown"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {assignment.teacher?.email || ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignment.subject?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.subject?.code || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignment.section?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.section?.year || ""} •{" "}
                            {assignment.section?.shift || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignment.academicYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              assignment.semester === "Fall"
                                ? "bg-orange-100 text-orange-800"
                                : assignment.semester === "Spring"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {assignment.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              assignment.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {assignment.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(assignment)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(assignment)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AssignmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditAssignment(null);
        }}
        onSuccess={fetchAssignments}
        editAssignment={editAssignment}
        teachers={teachers}
        subjects={subjects}
        sections={sections}
        success={success}
        error={error}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteAssignment(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
};

export default TeacherAssignmentPage;
