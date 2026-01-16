import React, { useState, useEffect } from "react";
import { collegeAdminTeacherService } from "../../services/collegeAdminTeacher.service";
import type {
  Teacher,
  CreateTeacherDto,
  TeacherCredentials,
} from "../../services/collegeAdminTeacher.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";

// ==================== Modal Components ====================

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onShowCredentials: (
    credentials: TeacherCredentials & { name: string }
  ) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowCredentials,
  success,
  error,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTeacherDto>({
    name: "",
    fatherName: "",
    gender: "Male",
    cnic: "",
    dateOfBirth: "",
    maritalStatus: "Single",
    religion: "",
    highestQualification: "",
    domicile: "",
    contactNumber: "",
    contactEmail: "",
    presentAddress: "",
    personalNumber: "",
    designation: "",
    bps: 1,
    employmentStatus: "Regular",
    superannuation: "",
    joinedServiceAt: "",
    joinedCollegeAt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await collegeAdminTeacherService.create(formData);
      success("Teacher created successfully!");
      onShowCredentials({
        loginEmail: result.credentials.loginEmail,
        password: result.credentials.password,
        name: result.teacher.name,
      });
      onClose();
      onSuccess();
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to create teacher");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add New Teacher</h2>
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
                minLength={3}
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
                Father's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={3}
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
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                required
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
                CNIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                pattern="\d{5}-\d{7}-\d{1}"
                placeholder="12345-1234567-1"
                value={formData.cnic}
                onChange={(e) =>
                  setFormData({ ...formData, cnic: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.maritalStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maritalStatus: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Religion <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={50}
                value={formData.religion}
                onChange={(e) =>
                  setFormData({ ...formData, religion: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domicile <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.domicile}
                onChange={(e) =>
                  setFormData({ ...formData, domicile: e.target.value })
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
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
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
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Present Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                minLength={10}
                maxLength={500}
                rows={2}
                value={formData.presentAddress}
                onChange={(e) =>
                  setFormData({ ...formData, presentAddress: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Professional Information */}
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Professional Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={formData.personalNumber}
                onChange={(e) =>
                  setFormData({ ...formData, personalNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BPS <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={22}
                value={formData.bps}
                onChange={(e) =>
                  setFormData({ ...formData, bps: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.employmentStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employmentStatus: e.target.value as "Regular" | "Contract",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Regular">Regular</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Highest Qualification <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.highestQualification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    highestQualification: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Superannuation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.superannuation}
                onChange={(e) =>
                  setFormData({ ...formData, superannuation: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joined Service At <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.joinedServiceAt}
                onChange={(e) =>
                  setFormData({ ...formData, joinedServiceAt: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joined College At <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.joinedCollegeAt}
                onChange={(e) =>
                  setFormData({ ...formData, joinedCollegeAt: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
              {loading ? "Creating..." : "Create Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Credentials Modal
interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: (TeacherCredentials & { name: string }) | null;
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
            Teacher account created successfully for {credentials.name}!
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

// Bulk Import Modal
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
  const [results, setResults] = useState<{
    summary: { total: number; successful: number; failed: number };
    results: {
      successful: Array<{
        row: number;
        teacherId: string;
        name: string;
        loginEmail: string;
        password: string;
      }>;
      failed: Array<{ row: number; data: any; error: string }>;
    };
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvData.trim()) {
      error("Please paste CSV data");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      // Parse CSV data
      const lines = csvData.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const teachers = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const teacher: any = {};

        headers.forEach((header, index) => {
          const key = header.toLowerCase().replace(/\s+/g, "");
          let value = values[index] || "";

          // Map CSV headers to API field names
          const fieldMap: Record<string, string> = {
            name: "name",
            fullname: "name",
            fathername: "fatherName",
            father: "fatherName",
            gender: "gender",
            cnic: "cnic",
            dateofbirth: "dateOfBirth",
            dob: "dateOfBirth",
            maritalstatus: "maritalStatus",
            marital: "maritalStatus",
            religion: "religion",
            qualification: "highestQualification",
            highestqualification: "highestQualification",
            education: "highestQualification",
            domicile: "domicile",
            contactnumber: "contactNumber",
            phone: "contactNumber",
            mobile: "contactNumber",
            contactemail: "contactEmail",
            email: "contactEmail",
            personalemail: "contactEmail",
            address: "presentAddress",
            presentaddress: "presentAddress",
            personalnumber: "personalNumber",
            designation: "designation",
            bps: "bps",
            employmentstatus: "employmentStatus",
            employment: "employmentStatus",
            superannuation: "superannuation",
            joinedserviceat: "joinedServiceAt",
            servicedate: "joinedServiceAt",
            joinedcollegeat: "joinedCollegeAt",
            collegedate: "joinedCollegeAt",
          };

          const mappedKey = fieldMap[key];
          if (mappedKey) {
            if (mappedKey === "bps") {
              teacher[mappedKey] = parseInt(value) || 1;
            } else {
              teacher[mappedKey] = value;
            }
          }
        });

        return teacher;
      });

      if (teachers.length === 0) {
        error("No valid teacher data found");
        setLoading(false);
        return;
      }

      if (teachers.length > 500) {
        error("Maximum 500 teachers allowed per import");
        setLoading(false);
        return;
      }

      const result = await collegeAdminTeacherService.bulkImport(teachers);
      setResults(result);

      if (result.summary.successful > 0) {
        success(
          `Successfully imported ${result.summary.successful} teacher(s)`
        );
        onSuccess();
      }

      if (result.summary.failed > 0) {
        error(`${result.summary.failed} teacher(s) failed to import`);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || "Bulk import failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCsvData("");
    setResults(null);
  };

  const downloadTemplate = () => {
    const template = [
      "Name,FatherName,Gender,CNIC,DateOfBirth,MaritalStatus,Religion,Qualification,Domicile,ContactNumber,ContactEmail,Address,PersonalNumber,Designation,BPS,EmploymentStatus,Superannuation,JoinedServiceAt,JoinedCollegeAt",
      "John Doe,Richard Doe,Male,12345-1234567-1,1990-01-15,Married,Islam,Master of Science,Punjab,03001234567,john.doe@example.com,123 Main Street Lahore,P001,Lecturer,17,Regular,2050-01-15,2020-01-15,2021-01-15",
      "Jane Smith,William Smith,Female,54321-7654321-1,1992-05-20,Single,Islam,Bachelor of Science,Sindh,03009876543,jane.smith@example.com,456 Park Avenue Karachi,P002,Assistant Professor,18,Contract,2052-05-20,2022-06-01,2023-01-01",
    ].join("\n");

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "teacher-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadSuccessfulResults = () => {
    if (!results || results.results.successful.length === 0) return;

    const csvContent = [
      "Row,Name,Login Email,Password",
      ...results.results.successful.map(
        (r) => `${r.row},${r.name},${r.loginEmail},${r.password}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `teacher-credentials-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Bulk Import Teachers
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Import up to 500 teachers at once using CSV format
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
              {/* CSV Format Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-900">
                    CSV Format Guide
                  </h3>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Download Template
                  </button>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  Required columns (comma-separated):
                </p>
                <code className="text-xs bg-white px-2 py-1 rounded block overflow-x-auto">
                  Name,FatherName,Gender,CNIC,DateOfBirth,MaritalStatus,Religion,Qualification,Domicile,ContactNumber,ContactEmail,Address,PersonalNumber,Designation,BPS,EmploymentStatus,Superannuation,JoinedServiceAt,JoinedCollegeAt
                </code>
                <div className="mt-3 text-xs text-blue-700">
                  <p className="font-medium mb-1">Field Notes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Gender: Male, Female, or Other</li>
                    <li>CNIC: Format 12345-1234567-1</li>
                    <li>Dates: YYYY-MM-DD format</li>
                    <li>
                      MaritalStatus: Single, Married, Divorced, or Widowed
                    </li>
                    <li>EmploymentStatus: Regular or Contract</li>
                    <li>BPS: Number between 1-22</li>
                    <li>ContactNumber: Pakistani mobile (03XXXXXXXXX)</li>
                  </ul>
                </div>
              </div>

              {/* CSV Input Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste CSV Data
                  </label>
                  <textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="Name,FatherName,Gender,CNIC,DateOfBirth,MaritalStatus,Religion,Qualification,Domicile,ContactNumber,ContactEmail,Address,PersonalNumber,Designation,BPS,EmploymentStatus,Superannuation,JoinedServiceAt,JoinedCollegeAt&#10;John Doe,Richard Doe,Male,12345-1234567-1,1990-01-15,Married,Islam,Master,Punjab,03001234567,john@example.com,123 Street,P001,Lecturer,17,Regular,2050-01-15,2020-01-15,2021-01-15"
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste your CSV data above (including header row)
                  </p>
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
                    {loading ? "Importing..." : "Import Teachers"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Import Results */}
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-900">
                      {results.summary.total}
                    </div>
                    <div className="text-sm text-blue-700">Total Processed</div>
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

                {/* Successful Imports */}
                {results.results.successful.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-green-900">
                        Successfully Imported (
                        {results.results.successful.length})
                      </h3>
                      <button
                        onClick={downloadSuccessfulResults}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Download Credentials
                      </button>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-green-100 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-green-900">
                                Row
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-green-900">
                                Name
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-green-900">
                                Login Email
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-green-900">
                                Password
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-green-200">
                            {results.results.successful.map((r) => (
                              <tr key={r.row}>
                                <td className="px-3 py-2 text-green-900">
                                  {r.row}
                                </td>
                                <td className="px-3 py-2 text-green-900">
                                  {r.name}
                                </td>
                                <td className="px-3 py-2 text-green-900 font-mono text-xs">
                                  {r.loginEmail}
                                </td>
                                <td className="px-3 py-2 text-green-900 font-mono text-xs">
                                  {r.password}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Failed Imports */}
                {results.results.failed.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-3">
                      Failed to Import ({results.results.failed.length})
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-red-100 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-red-900">
                                Row
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-red-900">
                                Name
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-red-900">
                                Error
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-200">
                            {results.results.failed.map((r, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 text-red-900">
                                  {r.row}
                                </td>
                                <td className="px-3 py-2 text-red-900">
                                  {r.data?.name || "N/A"}
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
                  </div>
                )}

                {/* Action Buttons */}
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

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { toasts, removeToast, success, error } = useToast();

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState<
    (TeacherCredentials & { name: string }) | null
  >(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const result = searchQuery
        ? await collegeAdminTeacherService.search(searchQuery, page, limit)
        : await collegeAdminTeacherService.getAll(page, limit);

      setTeachers(result.data || []);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to fetch teachers");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers();
  };

  const handleDelete = async (teacherId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await collegeAdminTeacherService.delete(teacherId);
      success("Teacher deleted successfully");
      fetchTeachers();
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to delete teacher");
    }
  };

  const handleResetPassword = async (teacherId: string, name: string) => {
    if (!confirm(`Reset password for ${name}?`)) return;

    try {
      const result = await collegeAdminTeacherService.resetPassword(teacherId);
      setCredentials({
        loginEmail: result.loginEmail,
        password: result.newPassword,
        name: result.name,
      });
      setShowCredentialsModal(true);
      success("Password reset successfully");
    } catch (err: any) {
      error(err?.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
        <p className="text-gray-600 mt-1">Manage your college teachers</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              placeholder="Search by name, CNIC, designation..."
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
            Add Teacher
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No teachers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNIC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {teacher.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {typeof teacher.userId === "object"
                            ? teacher.userId.email
                            : "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {teacher.cnic}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {teacher.designation}
                        </p>
                        <p className="text-xs text-gray-500">
                          BPS-{teacher.bps} • {teacher.employmentStatus}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-900">
                          {teacher.contactNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {teacher.contactEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          teacher.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {teacher.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleResetPassword(teacher._id, teacher.name)
                          }
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Reset Password"
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
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(teacher._id, teacher.name)
                          }
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && teachers.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, total)} of {total} teachers
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
      <AddTeacherModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchTeachers();
        }}
        onShowCredentials={(creds) => {
          setCredentials(creds);
          setShowCredentialsModal(true);
        }}
        success={success}
        error={error}
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
        onSuccess={() => {
          fetchTeachers();
        }}
        success={success}
        error={error}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default TeachersPage;
