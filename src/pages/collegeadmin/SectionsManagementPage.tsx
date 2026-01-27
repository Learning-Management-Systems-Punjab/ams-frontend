import React, { useState, useEffect } from "react";
import collegeAdminSectionManagementService from "../../services/collegeAdminSectionManagement.service";
import { collegeAdminProgramService } from "../../services/collegeAdminProgram.service";
import collegeAdminSubjectService from "../../services/collegeAdminSubject.service";
import { collegeAdminStudentService } from "../../services/collegeAdminStudent.service";
import type {
  Section,
  CreateSectionDto,
  SplitSectionsDto,
  SectionRange,
} from "../../services/collegeAdminSectionManagement.service";
import type { Program } from "../../services/collegeAdminProgram.service";
import type { Subject } from "../../services/collegeAdminSubject.service";
import type { Student } from "../../services/collegeAdminStudent.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";

// ==================== Add/Edit Section Modal ====================

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editSection?: Section | null;
  programs: Program[];
  subjects: Subject[];
  success: (message: string) => void;
  error: (message: string) => void;
}

const SectionModal: React.FC<SectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editSection,
  programs,
  subjects,
  success,
  error,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSectionDto>({
    name: "",
    programId: "",
    year: "1st Year",
    shift: "1st Shift",
    rollNumberRange: { start: 1, end: 50 },
    subjects: [],
    capacity: 50,
  });

  useEffect(() => {
    if (editSection) {
      setFormData({
        name: editSection.name,
        programId: editSection.programId,
        year: editSection.year,
        shift: editSection.shift,
        rollNumberRange: editSection.rollNumberRange || { start: 1, end: 50 },
        subjects: editSection.subjects,
        capacity: editSection.capacity,
      });
    } else {
      setFormData({
        name: "",
        programId: "",
        year: "1st Year",
        shift: "1st Shift",
        rollNumberRange: { start: 1, end: 50 },
        subjects: [],
        capacity: 50,
      });
    }
  }, [editSection, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.programId) {
      error("Please select a program");
      return;
    }

    if (
      formData.rollNumberRange?.start &&
      formData.rollNumberRange?.end &&
      formData.rollNumberRange.start >= formData.rollNumberRange.end
    ) {
      error("End roll number must be greater than start roll number");
      return;
    }

    setLoading(true);

    try {
      if (editSection) {
        await collegeAdminSectionManagementService.update(
          editSection._id,
          formData,
        );
        success("Section updated successfully!");
      } else {
        await collegeAdminSectionManagementService.create(formData);
        success("Section created successfully!");
      }
      onClose();
      onSuccess();
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to save section");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {editSection ? "Edit Section" : "Add New Section"}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Section A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.programId}
                  onChange={(e) =>
                    setFormData({ ...formData, programId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Program</option>
                  {programs.map((program) => (
                    <option key={program._id} value={program._id}>
                      {program.name} ({program.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.shift}
                  onChange={(e) =>
                    setFormData({ ...formData, shift: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1st Shift">1st Shift</option>
                  <option value="2nd Shift">2nd Shift</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Roll No <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.rollNumberRange?.start || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rollNumberRange: {
                        ...(formData.rollNumberRange || { start: 1, end: 50 }),
                        start: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Roll No <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.rollNumberRange?.end || 50}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rollNumberRange: {
                        ...(formData.rollNumberRange || { start: 1, end: 50 }),
                        end: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                {subjects.length === 0 ? (
                  <p className="text-gray-500 text-sm">No subjects available</p>
                ) : (
                  <div className="space-y-2">
                    {subjects.map((subject) => (
                      <label
                        key={subject._id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                subjects: [...formData.subjects, subject._id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                subjects: formData.subjects.filter(
                                  (id) => id !== subject._id,
                                ),
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {subject.name} ({subject.code})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select subjects for this section
              </p>
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
              {loading ? "Saving..." : editSection ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== Split Sections Modal (Key Feature ⭐) ====================

interface SplitSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  programs: Program[];
  subjects: Subject[];
  success: (message: string) => void;
  error: (message: string) => void;
}

const SplitSectionsModal: React.FC<SplitSectionsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  programs,
  subjects,
  success,
  error,
}) => {
  const [loading, setLoading] = useState(false);
  const [programId, setProgramId] = useState("");
  const [year, setYear] = useState("1st Year");
  const [sectionRanges, setSectionRanges] = useState<SectionRange[]>([
    {
      name: "Section A",
      start: 1,
      end: 50,
      shift: "1st Shift",
      subjects: [],
      capacity: 50,
    },
  ]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const addSectionRange = () => {
    const lastRange = sectionRanges[sectionRanges.length - 1];
    const nextStart = lastRange.end + 1;
    const nextEnd = nextStart + 49;
    const nextLetter = String.fromCharCode(65 + sectionRanges.length);

    setSectionRanges([
      ...sectionRanges,
      {
        name: `Section ${nextLetter}`,
        start: nextStart,
        end: nextEnd,
        shift: lastRange.shift,
        subjects: [...lastRange.subjects],
        capacity: 50,
      },
    ]);
  };

  const removeSectionRange = (index: number) => {
    if (sectionRanges.length > 1) {
      setSectionRanges(sectionRanges.filter((_, i) => i !== index));
    }
  };

  const updateSectionRange = (
    index: number,
    field: keyof SectionRange,
    value: any,
  ) => {
    const updated = [...sectionRanges];
    updated[index] = { ...updated[index], [field]: value };
    setSectionRanges(updated);
  };

  const validateRanges = (): boolean => {
    // Check for overlapping ranges
    for (let i = 0; i < sectionRanges.length; i++) {
      const range1 = sectionRanges[i];

      if (range1.start >= range1.end) {
        error(
          `Section ${range1.name}: End roll number must be greater than start`,
        );
        return false;
      }

      for (let j = i + 1; j < sectionRanges.length; j++) {
        const range2 = sectionRanges[j];

        if (
          (range1.start >= range2.start && range1.start <= range2.end) ||
          (range1.end >= range2.start && range1.end <= range2.end) ||
          (range2.start >= range1.start && range2.start <= range1.end)
        ) {
          error(
            `Roll number ranges overlap between ${range1.name} and ${range2.name}`,
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!programId) {
      error("Please select a program");
      return;
    }

    if (!validateRanges()) {
      return;
    }

    setLoading(true);

    try {
      const data: SplitSectionsDto = {
        programId,
        year,
        sectionRanges,
      };

      const result =
        await collegeAdminSectionManagementService.splitByRollRanges(data);
      setResults(result);
      setShowResults(true);
      success(
        `Successfully created ${result.summary.totalSections} sections and assigned ${result.summary.totalStudentsAssigned} students!`,
      );
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to split sections");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (showResults) {
      onSuccess();
    }
    setProgramId("");
    setYear("1st Year");
    setSectionRanges([
      {
        name: "Section A",
        start: 1,
        end: 50,
        shift: "1st Shift",
        subjects: [],
        capacity: 50,
      },
    ]);
    setShowResults(false);
    setResults(null);
    onClose();
  };

  if (!isOpen) return null;

  if (showResults && results) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Split Results</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">✅ Success!</h3>
              <p className="text-green-800">
                Created {results.summary.totalSections} sections and assigned{" "}
                {results.summary.totalStudentsAssigned} students
              </p>
            </div>

            <div className="space-y-4">
              {results.assignedStudents.map((section: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {section.sectionName}
                    </h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                      {section.studentCount} students
                    </span>
                  </div>

                  {section.students.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Assigned Students:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {section.students.slice(0, 10).map((student: any) => (
                          <span
                            key={student._id}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {student.rollNumber} - {student.name}
                          </span>
                        ))}
                        {section.students.length > 10 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{section.students.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleClose}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Split Sections by Roll Number Ranges ⭐
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create multiple sections and automatically assign students
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              💡 How it works:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Define roll number ranges for each section</li>
              <li>
                • Students will be automatically assigned based on their roll
                numbers
              </li>
              <li>• No overlapping ranges allowed</li>
            </ul>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Program</option>
                  {programs.map((program) => (
                    <option key={program._id} value={program._id}>
                      {program.name} ({program.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Section Ranges</h3>
              <button
                type="button"
                onClick={addSectionRange}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
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
                Add Section
              </button>
            </div>

            {sectionRanges.map((range, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                style={{
                  borderLeftColor: `hsl(${index * 60}, 70%, 50%)`,
                  borderLeftWidth: "4px",
                }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{range.name}</h4>
                  {sectionRanges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSectionRange(index)}
                      className="text-red-600 hover:text-red-700"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Section Name
                    </label>
                    <input
                      type="text"
                      required
                      value={range.name}
                      onChange={(e) =>
                        updateSectionRange(index, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Shift
                    </label>
                    <select
                      value={range.shift}
                      onChange={(e) =>
                        updateSectionRange(index, "shift", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="1st Shift">1st Shift</option>
                      <option value="2nd Shift">2nd Shift</option>
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start Roll No
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={range.start}
                      onChange={(e) =>
                        updateSectionRange(
                          index,
                          "start",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End Roll No
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={range.end}
                      onChange={(e) =>
                        updateSectionRange(
                          index,
                          "end",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={range.capacity}
                      onChange={(e) =>
                        updateSectionRange(
                          index,
                          "capacity",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Subjects
                  </label>
                  <div className="border border-gray-300 rounded-lg p-2 max-h-32 overflow-y-auto bg-gray-50">
                    {subjects.length === 0 ? (
                      <p className="text-gray-500 text-xs">
                        No subjects available
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {subjects.map((subject) => (
                          <label
                            key={subject._id}
                            className="flex items-center gap-2 cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={range.subjects.includes(subject._id)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...range.subjects, subject._id]
                                  : range.subjects.filter(
                                      (id) => id !== subject._id,
                                    );
                                updateSectionRange(index, "subjects", updated);
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">
                              {subject.name} ({subject.code})
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  Roll Range: {range.start} - {range.end} (
                  {range.end - range.start + 1} students)
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Sections..." : "Create Sections"}
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
  sectionName: string;
  loading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sectionName,
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
              Delete Section
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to delete <strong>"{sectionName}"</strong>?
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          This action cannot be undone. All student assignments will be removed.
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
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== View Students Modal ====================

interface ViewStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  section: Section | null;
  sections: Section[];
  success: (message: string) => void;
  error: (message: string) => void;
  initialTab?: "assigned" | "unassigned";
}

const ViewStudentsModal: React.FC<ViewStudentsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  section,
  sections,
  success,
  error,
  initialTab = "assigned",
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [targetSectionId, setTargetSectionId] = useState("");
  const [movingStudents, setMovingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"assigned" | "unassigned">(
    initialTab,
  );

  useEffect(() => {
    if (isOpen && section) {
      setActiveTab(initialTab);
      fetchStudents();
      fetchUnassignedStudents();
    }
  }, [isOpen, section, initialTab]);

  const fetchStudents = async () => {
    if (!section) return;

    setLoading(true);
    try {
      const data = await collegeAdminStudentService.getBySection(section._id);
      setStudents(
        data.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber)),
      );
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedStudents = async () => {
    if (!section) return;

    setLoadingUnassigned(true);
    try {
      // Fetch ALL unassigned students (without program filter)
      // This allows assigning students from any program to this section
      const response = await collegeAdminStudentService.getAll(1, 1000, {
        noSection: true,
      });

      setUnassignedStudents(
        response.data.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber)),
      );
    } catch (err: any) {
      error(
        err.response?.data?.message || "Failed to fetch unassigned students",
      );
    } finally {
      setLoadingUnassigned(false);
    }
  };

  const handleAssignToSection = async () => {
    if (selectedStudents.length === 0) {
      error("Please select at least one student");
      return;
    }

    if (!section) return;

    setMovingStudents(true);
    try {
      const result = await collegeAdminStudentService.moveToSection(
        selectedStudents,
        section._id,
      );
      success(
        `Successfully assigned ${result.updatedCount} student(s) to ${section.name}`,
      );
      setSelectedStudents([]);
      fetchStudents();
      fetchUnassignedStudents();
      setActiveTab("assigned");
      // Notify parent to refetch sections (to update student counts)
      onSuccess?.();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to assign students");
    } finally {
      setMovingStudents(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((s) => s._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    }
  };

  const handleMoveStudents = async () => {
    if (!targetSectionId || selectedStudents.length === 0) {
      error("Please select a target section and at least one student");
      return;
    }

    setMovingStudents(true);
    try {
      const result = await collegeAdminStudentService.moveToSection(
        selectedStudents,
        targetSectionId,
      );
      success(
        `Successfully moved ${result.updatedCount} student(s) to the new section`,
      );
      setSelectedStudents([]);
      setTargetSectionId("");
      fetchStudents();
      // Notify parent to refetch sections (to update student counts)
      onSuccess?.();
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to move students");
    } finally {
      setMovingStudents(false);
    }
  };

  const handleSelectByRollRange = () => {
    const startRoll = prompt("Enter start roll number (e.g., 101):");
    const endRoll = prompt("Enter end roll number (e.g., 150):");

    if (!startRoll || !endRoll) return;

    const selected = students.filter((student) => {
      const rollNum = parseInt(student.rollNumber.replace(/\D/g, ""));
      const start = parseInt(startRoll.replace(/\D/g, ""));
      const end = parseInt(endRoll.replace(/\D/g, ""));
      return rollNum >= start && rollNum <= end;
    });

    setSelectedStudents(selected.map((s) => s._id));
    success(
      `Selected ${selected.length} students in range ${startRoll} - ${endRoll}`,
    );
  };

  if (!isOpen || !section) return null;

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const availableSections = sections.filter((s) => s._id !== section._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Students in {section.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {section.program?.name || "N/A"} - {section.year} (
                {section.shift})
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Roll Range: {section.rollNumberRange?.start || 1} -{" "}
                {section.rollNumberRange?.end || 50} | Total: {students.length}{" "}
                students
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("assigned")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "assigned"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Assigned Students ({students.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("unassigned");
                if (unassignedStudents.length === 0) {
                  fetchUnassignedStudents();
                }
              }}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "unassigned"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Unassigned Students ({unassignedStudents.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "assigned" ? (
            // Assigned Students Tab
            loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No students found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This section doesn't have any students assigned yet.
                </p>
              </div>
            ) : (
              <>
                {/* Search and Actions */}
                <div className="mb-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search by name or roll number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                      onClick={handleSelectByRollRange}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
                    >
                      Select by Range
                    </button>
                  </div>

                  {selectedStudents.length > 0 && (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedStudents.length} student(s) selected
                      </span>
                      <select
                        value={targetSectionId}
                        onChange={(e) => setTargetSectionId(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Move to section...</option>
                        {availableSections.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} - {s.year} ({s.shift})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleMoveStudents}
                        disabled={movingStudents || !targetSectionId}
                        className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {movingStudents ? "Moving..." : "Move"}
                      </button>
                      <button
                        onClick={() => setSelectedStudents([])}
                        className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Students Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={
                              selectedStudents.length ===
                                filteredStudents.length &&
                              filteredStudents.length > 0
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll No.
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Father Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr
                          key={student._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student._id)}
                              onChange={(e) =>
                                handleSelectStudent(
                                  student._id,
                                  e.target.checked,
                                )
                              }
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {student.rollNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {student.fatherName}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                student.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : student.status === "Graduated"
                                    ? "bg-blue-100 text-blue-800"
                                    : student.status === "Inactive"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          ) : // Unassigned Students Tab
          loadingUnassigned ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : unassignedStudents.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No unassigned students
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                All students have been assigned to sections, or no students have
                been imported yet.
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Import students from the Students page to assign them to
                sections.
              </p>
            </div>
          ) : (
            <>
              {/* Search and Actions for Unassigned */}
              <div className="mb-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {selectedStudents.length > 0 && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <span className="text-sm font-medium text-green-900">
                      {selectedStudents.length} student(s) selected
                    </span>
                    <button
                      onClick={handleAssignToSection}
                      disabled={movingStudents}
                      className="ml-auto px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {movingStudents ? "Assigning..." : "Assign to Section"}
                    </button>
                    <button
                      onClick={() => setSelectedStudents([])}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Unassigned Students Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedStudents.length ===
                              unassignedStudents.filter(
                                (s) =>
                                  s.name
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()) ||
                                  s.rollNumber
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()),
                              ).length &&
                            unassignedStudents.filter(
                              (s) =>
                                s.name
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                s.rollNumber
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()),
                            ).length > 0
                          }
                          onChange={(e) => {
                            const filtered = unassignedStudents.filter(
                              (s) =>
                                s.name
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                s.rollNumber
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()),
                            );
                            setSelectedStudents(
                              e.target.checked
                                ? filtered.map((s) => s._id)
                                : [],
                            );
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Father Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Program
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unassignedStudents
                      .filter(
                        (s) =>
                          s.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          s.rollNumber
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map((student) => (
                        <tr
                          key={student._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student._id)}
                              onChange={(e) =>
                                handleSelectStudent(
                                  student._id,
                                  e.target.checked,
                                )
                              }
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {student.rollNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {student.fatherName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {typeof student.programId === "object" &&
                            student.programId
                              ? student.programId.name
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                student.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : student.status === "Graduated"
                                    ? "bg-blue-100 text-blue-800"
                                    : student.status === "Inactive"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== Main Sections Page ====================

const SectionsManagementPage: React.FC = () => {
  const { success, error, toasts, removeToast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSections, setTotalSections] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewStudentsModal, setShowViewStudentsModal] = useState(false);
  const [viewStudentsInitialTab, setViewStudentsInitialTab] = useState<
    "assigned" | "unassigned"
  >("assigned");
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [deleteSection, setDeleteSection] = useState<Section | null>(null);
  const [viewStudentsSection, setViewStudentsSection] =
    useState<Section | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterProgram, setFilterProgram] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const limit = 12;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSections();
  }, [currentPage, filterProgram, filterYear]);

  const fetchInitialData = async () => {
    try {
      const [programsRes, subjectsRes] = await Promise.all([
        collegeAdminProgramService.getAll(),
        collegeAdminSubjectService.getAll(1, 100),
      ]);
      setPrograms(programsRes);
      setSubjects(subjectsRes.subjects);
    } catch (err: any) {
      error("Failed to load programs or subjects");
    }
  };

  const fetchSections = async () => {
    setLoading(true);
    try {
      const filters: any = { page: currentPage, limit };
      if (filterProgram) filters.programId = filterProgram;
      if (filterYear) filters.year = filterYear;

      const response =
        await collegeAdminSectionManagementService.getAll(filters);
      setSections(response.sections);
      setTotalPages(response.totalPages);
      setTotalSections(response.totalSections);
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to fetch sections");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: Section) => {
    setEditSection(section);
    setShowModal(true);
  };

  const handleViewStudents = (section: Section) => {
    setViewStudentsSection(section);
    setViewStudentsInitialTab("assigned");
    setShowViewStudentsModal(true);
  };

  const handleAssignStudents = (section: Section) => {
    setViewStudentsSection(section);
    setViewStudentsInitialTab("unassigned");
    setShowViewStudentsModal(true);
  };

  const handleDeleteClick = (section: Section) => {
    setDeleteSection(section);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSection) return;

    setDeleteLoading(true);
    try {
      await collegeAdminSectionManagementService.delete(deleteSection._id);
      success("Section deleted successfully!");
      setShowDeleteModal(false);
      setDeleteSection(null);
      fetchSections();
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to delete section");
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterProgram("");
    setFilterYear("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Workflow Tip Banner */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-orange-600"
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
            <p className="text-sm text-orange-800">
              <strong>Step 2 of 5:</strong> Create sections and assign subjects
              to them. Click "Students" on any section card to assign/manage
              students. Use "Split Sections" to quickly create multiple sections
              by roll number ranges.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Sections
            </h1>
            <p className="text-gray-600 mt-1">
              Create sections and split by roll number ranges
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSplitModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-sm flex items-center gap-2"
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Split Sections ⭐
            </button>
            <button
              onClick={() => {
                setEditSection(null);
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
              Add Section
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-3">
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

            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>

            {(filterProgram || filterYear) && (
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalSections}
              </p>
              <p className="text-sm text-gray-600">Total Sections</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : sections.length === 0 ? (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No sections found
            </h3>
            <p className="text-gray-600 mb-4">
              {filterProgram || filterYear
                ? "Try adjusting your filters"
                : "Get started by creating your first section"}
            </p>
            {!filterProgram && !filterYear && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Section
                </button>
                <button
                  onClick={() => setShowSplitModal(true)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Split Sections
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((section) => (
                <div
                  key={section._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Header with color indicator */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {section.name}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {section.program?.name || "Unknown Program"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        section.isActive
                          ? "bg-green-400 text-green-900"
                          : "bg-gray-400 text-gray-900"
                      }`}
                    >
                      {section.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="p-4">
                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <span className="block text-lg font-bold text-green-700">
                          {section.currentStrength || 0}
                        </span>
                        <span className="text-xs text-green-600">Students</span>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <span className="block text-lg font-bold text-blue-700">
                          {section.subjects?.length || 0}
                        </span>
                        <span className="text-xs text-blue-600">Subjects</span>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2 text-center">
                        <span className="block text-lg font-bold text-purple-700">
                          {section.capacity || 50}
                        </span>
                        <span className="text-xs text-purple-600">
                          Capacity
                        </span>
                      </div>
                    </div>

                    {/* Section Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {section.year} • {section.shift}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                          />
                        </svg>
                        <span>
                          Roll Range: {section.rollNumberRange?.start || 1} -{" "}
                          {section.rollNumberRange?.end || 50}
                        </span>
                      </div>
                    </div>

                    {/* Subjects Display */}
                    {section.subjects && section.subjects.length > 0 ? (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          Assigned Subjects:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {section.subjects
                            .slice(0, 4)
                            .map((subjectId, idx) => {
                              const subject = subjects.find(
                                (s) => s._id === subjectId,
                              );
                              return subject ? (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium"
                                >
                                  {subject.code}
                                </span>
                              ) : null;
                            })}
                          {section.subjects.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{section.subjects.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700">
                          ⚠️ No subjects assigned yet. Click edit to add
                          subjects.
                        </p>
                      </div>
                    )}

                    {/* Action Buttons - Row 1: Student Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleAssignStudents(section)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                        title="Assign Students to Section"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                        Assign Students
                      </button>
                      <button
                        onClick={() => handleViewStudents(section)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                        title="View Assigned Students"
                      >
                        <svg
                          className="w-4 h-4"
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
                        View
                      </button>
                    </div>

                    {/* Action Buttons - Row 2: Edit/Delete */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(section)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                        title="Edit Section"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(section)}
                        className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                        title="Delete Section"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
      <SectionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditSection(null);
        }}
        onSuccess={fetchSections}
        editSection={editSection}
        programs={programs}
        subjects={subjects}
        success={success}
        error={error}
      />

      <SplitSectionsModal
        isOpen={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        onSuccess={fetchSections}
        programs={programs}
        subjects={subjects}
        success={success}
        error={error}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteSection(null);
        }}
        onConfirm={handleDeleteConfirm}
        sectionName={deleteSection?.name || ""}
        loading={deleteLoading}
      />

      <ViewStudentsModal
        isOpen={showViewStudentsModal}
        onClose={() => {
          setShowViewStudentsModal(false);
          setViewStudentsSection(null);
        }}
        onSuccess={fetchSections}
        section={viewStudentsSection}
        sections={sections}
        success={success}
        error={error}
        initialTab={viewStudentsInitialTab}
      />
    </div>
  );
};

export default SectionsManagementPage;
