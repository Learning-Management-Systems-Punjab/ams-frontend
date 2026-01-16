import React, { useState, useEffect } from "react";
import { collegeAdminStudentService } from "../../services/collegeAdminStudent.service";
import { collegeAdminProgramService } from "../../services/collegeAdminProgram.service";
import { collegeAdminSectionService } from "../../services/collegeAdminSection.service";
import type {
  Student,
  CreateStudentDto,
  StudentCredentials,
  StudentFilters,
} from "../../services/collegeAdminStudent.service";
import type { Program } from "../../services/collegeAdminProgram.service";
import type { Section } from "../../services/collegeAdminSection.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";
import * as XLSX from "xlsx";

// ==================== CSV Parser Utility ====================
/**
 * Properly parse CSV data respecting quoted values
 * This handles commas inside quoted fields
 */
const parseCSV = (csvText: string): string[][] => {
  const lines: string[][] = [];
  const rows = csvText.split(/\r?\n/);

  for (const row of rows) {
    if (!row.trim()) continue;

    const fields: string[] = [];
    let currentField = "";
    let insideQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        // Handle escaped quotes ("")
        if (insideQuotes && row[i + 1] === '"') {
          currentField += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        // End of field
        fields.push(currentField.trim());
        currentField = "";
      } else {
        currentField += char;
      }
    }

    // Add the last field
    fields.push(currentField.trim());
    lines.push(fields);
  }

  return lines;
};

// ==================== Add Student Modal ====================

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onShowCredentials: (
    credentials: StudentCredentials & { name: string; rollNumber: string }
  ) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  programs: Program[];
  sections: Section[];
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowCredentials,
  success,
  error,
  programs,
  sections,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateStudentDto>({
    name: "",
    rollNumber: "",
    fatherName: "",
    contactNumber: "",
    cnic: "",
    email: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
    programId: "",
    sectionId: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    status: "Active",
    createLoginAccount: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await collegeAdminStudentService.create(formData);
      success("Student created successfully!");

      if (result.credentials) {
        onShowCredentials({
          loginEmail: result.credentials.loginEmail,
          password: result.credentials.password,
          name: result.student.name,
          rollNumber: result.student.rollNumber,
        });
      }

      onClose();
      onSuccess();
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900">Add New Student</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Personal Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={1}
                maxLength={50}
                value={formData.rollNumber}
                onChange={(e) =>
                  setFormData({ ...formData, rollNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Father's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.fatherName}
                onChange={(e) =>
                  setFormData({ ...formData, fatherName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as "Male" | "Female" | "Other",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNIC (13 digits)
              </label>
              <input
                type="text"
                pattern="\d{13}|\d{5}-\d{7}-\d{1}"
                placeholder="1234567890123 or 12345-1234567-1"
                value={formData.cnic}
                onChange={(e) =>
                  setFormData({ ...formData, cnic: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Contact Information */}
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Contact Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                pattern="03\d{9}"
                placeholder="03XXXXXXXXX"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                maxLength={500}
                rows={2}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Academic Information */}
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Academic Information
              </h3>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Date
              </label>
              <input
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) =>
                  setFormData({ ...formData, enrollmentDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.createLoginAccount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      createLoginAccount: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Create login account for student (Email will be:{" "}
                  {formData.rollNumber || "rollnumber"}@collegecode.edu.pk)
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== Credentials Modal ====================

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials:
    | (StudentCredentials & {
        name: string;
        rollNumber: string;
      })
    | null;
  success: (message: string) => void;
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  credentials,
  success,
}) => {
  if (!isOpen || !credentials) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Login Credentials</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-800 font-medium mb-2">
            Student account created successfully for {credentials.name} (Roll:{" "}
            {credentials.rollNumber})!
          </p>
          <p className="text-xs text-green-700">
            Please save these credentials securely. They will not be shown
            again.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Login Email
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={credentials.loginEmail}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(credentials.loginEmail);
                  success("Email copied!");
                }}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={credentials.password}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(credentials.password);
                  success("Password copied!");
                }}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </div>
  );
};

// ==================== Bulk Import Modal ====================

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  success,
  error,
}) => {
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [createLoginAccounts, setCreateLoginAccounts] = useState(true); // Default to true
  const [results, setResults] = useState<any>(null);
  const [uploadMethod, setUploadMethod] = useState<"paste" | "file">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  const downloadTemplate = () => {
    // Properly quote CSV values that contain commas
    const template = [
      "Student Name,Roll No,Father Name,Program,Class,Subject-Combination,Student Phone,Student CNIC/FORM-B,Email,Date of Birth,Gender,Address,Status",
      '"Ahmed Ali",001,"Muhammad Ali","F.Sc. (Pre-Engineering)-Mathematics, Chemistry, Physics","1st Year","1st Shift - Mathematics, Chemistry, Physics",03001234567,12345-1234567-1,ahmed@example.com,2005-01-15,Male,"123 Main St",Active',
      '"Sara Khan",002,"Imran Khan","F.Sc. (Pre-Medical)-Biology, Chemistry, Physics","1st Year","1st Shift - Biology, Chemistry, Physics",03009876543,32109-8765432-1,sara@example.com,2006-03-20,Female,"456 Park Ave",Active',
    ].join("\n");

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xls", "xlsx"].includes(fileExtension || "")) {
      error("Please upload a CSV or Excel file (.csv, .xls, .xlsx)");
      return;
    }

    setSelectedFile(file);

    // Read file content
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;

      if (fileExtension === "csv") {
        setCsvData(content);
      } else {
        // For Excel files, we'll parse them using a library
        try {
          // Use xlsx library to parse Excel
          const XLSX = await import("xlsx");
          const workbook = XLSX.read(content, { type: "binary" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvContent = XLSX.utils.sheet_to_csv(firstSheet);
          setCsvData(csvContent);
        } catch (err) {
          error(
            "Failed to parse Excel file. Please ensure it's a valid Excel file or use CSV format."
          );
        }
      }
    };

    if (fileExtension === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvData.trim()) {
      error("Please paste CSV data");
      return;
    }

    setLoading(true);
    setResults(null);
    setValidationErrors([]);

    try {
      // Use proper CSV parser that respects quoted values
      const parsedLines = parseCSV(csvData.trim());

      if (parsedLines.length < 2) {
        error("CSV must contain headers and at least one data row");
        setLoading(false);
        return;
      }

      const headers = parsedLines[0].map((h) => h.trim());
      const dataLines = parsedLines.slice(1);

      const students = dataLines.map((values) => {
        const student: any = {};

        headers.forEach((header, index) => {
          const value = (values[index] || "").trim();

          // Map CSV headers to expected format
          // Keep original CSV column names for /bulk-import-csv endpoint
          const csvFieldMap: Record<string, string> = {
            "Student Name": "Student Name",
            studentname: "Student Name",
            name: "Student Name",
            "Roll No": "Roll No",
            rollno: "Roll No",
            rollnumber: "Roll No",
            "Father Name": "Father Name",
            fathername: "Father Name",
            father: "Father Name",
            Program: "Program",
            program: "Program",
            Class: "Class",
            class: "Class",
            year: "Class",
            "Subject-Combination": "Subject-Combination",
            subjectcombination: "Subject-Combination",
            section: "Subject-Combination",
            "Student Phone": "Student Phone",
            studentphone: "Student Phone",
            phone: "Student Phone",
            contactnumber: "Student Phone",
            "Student CNIC/FORM-B": "Student CNIC/FORM-B",
            "studentcnic/form-b": "Student CNIC/FORM-B",
            cnic: "Student CNIC/FORM-B",
            Email: "Email",
            email: "Email",
            "Date of Birth": "Date of Birth",
            dateofbirth: "Date of Birth",
            dob: "Date of Birth",
            Gender: "Gender",
            gender: "Gender",
            Address: "Address",
            address: "Address",
            Status: "Status",
            status: "Status",
          };

          const normalizedHeader = header.toLowerCase().replace(/\s+/g, "");
          const mappedKey =
            csvFieldMap[header] || csvFieldMap[normalizedHeader];

          if (mappedKey && value) {
            student[mappedKey] = value;
          }
        });

        return student;
      });

      if (students.length === 0) {
        error("No valid student data found");
        setLoading(false);
        return;
      }

      if (students.length > 500) {
        error("Maximum 500 students allowed per import");
        setLoading(false);
        return;
      }

      console.log("Importing students (CSV format):", {
        count: students.length,
        createLoginAccounts,
        sampleStudent: students[0],
      });

      const result = await collegeAdminStudentService.bulkImportCSV(
        students,
        createLoginAccounts
      );
      setResults(result);

      if (result.summary.successful > 0) {
        success(
          `Successfully imported ${result.summary.successful} student(s)`
        );
        onSuccess();
      }

      if (result.summary.failed > 0) {
        error(`${result.summary.failed} student(s) failed to import`);
      }
    } catch (err: any) {
      console.error("Bulk import error:", err);

      // Handle validation errors
      if (err?.response?.status === 400 && err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        setValidationErrors(errors);

        // Group errors by row/field
        const errorMessages = errors
          .map((e: any) => {
            const field = e.field || "unknown";
            const message = e.message || "Validation error";

            // Extract row number from field path (e.g., "students[0].name" -> row 1)
            const rowMatch = field.match(/students\[(\d+)\]/);
            const rowNum = rowMatch ? parseInt(rowMatch[1]) + 1 : null;

            if (rowNum) {
              return `Row ${rowNum}: ${message} (${field.split(".").pop()})`;
            }
            return `${message} (${field})`;
          })
          .slice(0, 5) // Show first 5 errors
          .join("\n");

        error(
          `Validation failed:\n${errorMessages}${
            errors.length > 5 ? `\n...and ${errors.length - 5} more errors` : ""
          }`
        );
      } else {
        error(err?.response?.data?.message || "Bulk import failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCsvData("");
    setValidationErrors([]);
    setResults(null);
  };

  const downloadResults = () => {
    if (!results || results.results.successful.length === 0) return;

    const csvContent = [
      createLoginAccounts
        ? "Row,Roll Number,Name,Login Email,Password"
        : "Row,Roll Number,Name",
      ...results.results.successful.map((r: any) =>
        createLoginAccounts
          ? `${r.row},${r.rollNumber},${r.name},${
              r.credentials?.loginEmail || ""
            },${r.credentials?.password || ""}`
          : `${r.row},${r.rollNumber},${r.name}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `student-import-results-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Bulk Import Students
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Import up to 500 students at once
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {!results ? (
            <>
              {/* Validation Errors Display */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">
                        Validation Errors Found
                      </h3>
                      <div className="space-y-1 text-sm text-red-800 max-h-48 overflow-y-auto">
                        {validationErrors.map((err, idx) => {
                          const field = err.field || "unknown";
                          const message = err.message || "Validation error";

                          // Extract row number from field path
                          const rowMatch = field.match(/students\[(\d+)\]/);
                          const rowNum = rowMatch
                            ? parseInt(rowMatch[1]) + 1
                            : null;
                          const fieldName = field.split(".").pop();

                          return (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-red-600 font-mono text-xs">
                                •
                              </span>
                              <span>
                                {rowNum ? (
                                  <>
                                    <strong>Row {rowNum}</strong>: {message}
                                    <span className="text-red-600">
                                      {" "}
                                      ({fieldName})
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    {message}{" "}
                                    <span className="text-red-600">
                                      ({field})
                                    </span>
                                  </>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {validationErrors.length > 10 && (
                        <p className="text-xs text-red-700 mt-2">
                          Showing first 10 errors. Total:{" "}
                          {validationErrors.length} errors
                        </p>
                      )}
                      <button
                        onClick={() => setValidationErrors([])}
                        className="mt-3 text-xs text-red-700 hover:text-red-900 underline"
                      >
                        Clear errors
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-900">Import Guide</h3>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Download CSV Template
                  </button>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  Required columns: Student Name, Roll No, Father Name, Program
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  Optional: Class, Subject-Combination, Student Phone, Student
                  CNIC/FORM-B, Email, Date of Birth, Gender, Address, Status
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  Program format: "F.Sc. (Pre-Engineering)-Mathematics,
                  Chemistry, Physics" (use commas to separate subjects)
                </p>
                <p className="text-xs text-blue-700">
                  Supported formats: CSV (.csv), Excel (.xls, .xlsx)
                </p>
              </div>

              {/* Upload Method Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => setUploadMethod("file")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      uploadMethod === "file"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Upload File (CSV/Excel)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod("paste")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      uploadMethod === "paste"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Paste CSV Data
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {uploadMethod === "file" ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload File
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 flex flex-col items-center px-4 py-6 bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        <svg
                          className="w-12 h-12 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {selectedFile
                            ? selectedFile.name
                            : "Click to upload CSV or Excel file"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Supports: .csv, .xls, .xlsx
                        </span>
                        <input
                          type="file"
                          accept=".csv,.xls,.xlsx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {selectedFile && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        File loaded: {selectedFile.name}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste CSV Data
                    </label>
                    <textarea
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      rows={10}
                      placeholder="name,rollNumber,fatherName,programId,sectionId&#10;Ahmed Ali,123,Muhammad Ali,PROGRAM_ID,SECTION_ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createLoginAccounts}
                        onChange={(e) =>
                          setCreateLoginAccounts(e.target.checked)
                        }
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm font-medium text-green-900">
                        Create login accounts for all students
                        <span className="text-green-700 font-normal ml-1">
                          (Recommended - generates
                          rollnumber@collegecode.edu.pk)
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !csvData.trim()}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Importing..." : "Import Students"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-900">
                      {results.summary.total}
                    </div>
                    <div className="text-sm text-blue-700">Total</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-900">
                      {results.summary.successful}
                    </div>
                    <div className="text-sm text-green-700">Successful</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-900">
                      {results.summary.failed}
                    </div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                </div>

                {results.results.successful.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-green-900">
                        Successfully Imported (
                        {results.results.successful.length})
                      </h3>
                      <button
                        onClick={downloadResults}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Download Results
                      </button>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-green-100 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-green-900">
                              Row
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-green-900">
                              Roll
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-green-900">
                              Name
                            </th>
                            {createLoginAccounts && (
                              <>
                                <th className="px-3 py-2 text-left text-xs font-medium text-green-900">
                                  Email
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-green-900">
                                  Password
                                </th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-200">
                          {results.results.successful.map((r: any) => (
                            <tr key={r.row}>
                              <td className="px-3 py-2 text-green-900">
                                {r.row}
                              </td>
                              <td className="px-3 py-2 text-green-900">
                                {r.rollNumber}
                              </td>
                              <td className="px-3 py-2 text-green-900">
                                {r.name}
                              </td>
                              {createLoginAccounts && (
                                <>
                                  <td className="px-3 py-2 text-green-900 font-mono text-xs">
                                    {r.credentials?.loginEmail || "N/A"}
                                  </td>
                                  <td className="px-3 py-2 text-green-900 font-mono text-xs">
                                    {r.credentials?.password || "N/A"}
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {results.results.failed.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-3">
                      Failed ({results.results.failed.length})
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-red-100 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-red-900">
                              Row
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-red-900">
                              Error
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-200">
                          {results.results.failed.map((r: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 text-red-900">
                                {r.row}
                              </td>
                              <td className="px-3 py-2 text-red-900">
                                {r.error}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Import More
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== Main Component ====================

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [filters, setFilters] = useState<StudentFilters>({});
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const { toasts, removeToast, success, error } = useToast();

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState<
    (StudentCredentials & { name: string; rollNumber: string }) | null
  >(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const result = searchQuery
        ? await collegeAdminStudentService.search(searchQuery, page, limit)
        : await collegeAdminStudentService.getAll(page, limit, filters);

      setStudents(result.data || []);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to fetch students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, filters]);

  useEffect(() => {
    // Fetch programs and sections
    const fetchProgramsAndSections = async () => {
      try {
        const [programsData, sectionsData] = await Promise.all([
          collegeAdminProgramService.getAll(),
          collegeAdminSectionService.getAll(),
        ]);
        setPrograms(programsData);
        setSections(sectionsData);

        // Log for debugging
        console.log("Fetched programs:", programsData.length);
        console.log("Fetched sections:", sectionsData.length);

        if (programsData.length === 0 || sectionsData.length === 0) {
          error(
            "Warning: No programs or sections found. Please ensure you have programs and sections configured in your college."
          );
        }
      } catch (err: any) {
        console.error("Error fetching programs/sections:", err);
        error(
          err?.response?.data?.message ||
            "Failed to fetch programs and sections"
        );
      }
    };

    fetchProgramsAndSections();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleDelete = async (studentId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await collegeAdminStudentService.delete(studentId);
      success("Student deleted successfully");
      fetchStudents();
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to delete student");
    }
  };

  const handleExport = async () => {
    try {
      const data = await collegeAdminStudentService.export(filters);
      const csv = [
        "Roll Number,Name,Father Name,Contact,CNIC,Email,Login Email,Program,Section,Year,Shift,Status,Enrollment Date",
        ...data.map(
          (s) =>
            `${s.rollNumber},${s.name},${s.fatherName},${
              s.contactNumber || ""
            },${s.cnic || ""},${s.email || ""},${s.loginEmail || ""},${
              s.program
            },${s.section},${s.year},${s.shift},${s.status},${s.enrollmentDate}`
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `students-export-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      success("Students exported successfully");
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to export students");
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600 mt-1">Manage your college students</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by name, roll number, CNIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Search
            </button>
          </form>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export
            </button>
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Bulk Import
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
              Add Student
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.programId || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                programId: e.target.value || undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Programs</option>
            {programs.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={filters.sectionId || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                sectionId: e.target.value || undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} - {s.year}
              </option>
            ))}
          </select>

          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value as any,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Graduated">Graduated</option>
            <option value="Dropped">Dropped</option>
          </select>

          {(filters.programId || filters.sectionId || filters.status) && (
            <button
              onClick={() => setFilters({})}
              className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Roll Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Father Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.name}
                        </p>
                        {student.email && (
                          <p className="text-xs text-gray-500">
                            {student.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {student.fatherName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {typeof student.programId === "object"
                        ? student.programId.name
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {typeof student.sectionId === "object"
                        ? `${student.sectionId.name} - ${student.sectionId.year}`
                        : "N/A"}
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
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(student._id, student.name)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && students.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} students
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum =
                    totalPages <= 5
                      ? i + 1
                      : page <= 3
                      ? i + 1
                      : page >= totalPages - 2
                      ? totalPages - 4 + i
                      : page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 border rounded-lg ${
                        page === pageNum
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchStudents}
        onShowCredentials={(creds) => {
          setCredentials(creds);
          setShowCredentialsModal(true);
        }}
        success={success}
        error={error}
        programs={programs}
        sections={sections}
      />

      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        credentials={credentials}
        success={success}
      />

      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onSuccess={fetchStudents}
        success={success}
        error={error}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default StudentsPage;
