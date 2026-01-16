import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Eye,
  Mail,
  CreditCard,
  Phone,
  CheckCircle,
  XCircle,
  Filter,
  Building2,
  Award,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { Skeleton } from "../../components/ui/Skeleton";
import { Modal } from "../../components/ui/Modal";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "../../components/ui/ModalParts";
import { teacherService, type Teacher } from "../../services/teacher.service";
import { useToast } from "../../hooks/useToast";

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const { error: showError } = useToast();
  const itemsPerPage = 10;

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (searchQuery.trim()) {
        setIsSearching(true);
        response = await teacherService.search(
          searchQuery,
          currentPage,
          itemsPerPage
        );
      } else {
        setIsSearching(false);
        response = await teacherService.getAll(currentPage, itemsPerPage);
      }

      setTeachers(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.total || 0);
    } catch (err: any) {
      console.error("Failed to fetch teachers:", err);
      showError(err.response?.data?.message || "Failed to load teachers");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, showError]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchTeachers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleView = async (teacher: Teacher) => {
    try {
      const fullData = await teacherService.getById(teacher._id);
      setSelectedTeacher(fullData);
      setShowViewModal(true);
    } catch (err: any) {
      console.error("Failed to fetch teacher details:", err);
      showError(err.response?.data?.message || "Failed to load details");
    }
  };

  const columns = [
    { key: "name", header: "Teacher Name" },
    { key: "email", header: "Email" },
    { key: "cnic", header: "CNIC" },
    { key: "college", header: "College" },
    { key: "qualification", header: "Qualification" },
    { key: "status", header: "Status" },
    { key: "actions", header: "Actions" },
  ];

  const renderRow = (teacher: Teacher) => (
    <tr
      key={teacher._id}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => handleView(teacher)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
            {teacher.phoneNumber && (
              <p className="text-xs text-gray-500">{teacher.phoneNumber}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{teacher.email}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 font-mono">
            {teacher.cnic}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        {teacher.college ? (
          <div>
            <p className="text-sm font-medium text-gray-900">
              {teacher.college.name}
            </p>
            <p className="text-xs text-gray-500">{teacher.college.code}</p>
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">Not assigned</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div>
          {teacher.qualification && (
            <p className="text-sm text-gray-900">{teacher.qualification}</p>
          )}
          {teacher.experience !== undefined && (
            <p className="text-xs text-gray-500">
              {teacher.experience} years exp.
            </p>
          )}
          {!teacher.qualification && (
            <span className="text-sm text-gray-500 italic">N/A</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        {teacher.isActive ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div
          className="flex items-center space-x-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleView(teacher)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
              <p className="text-sm text-gray-500 mt-1">
                View and manage all teachers in the system
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or CNIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {isSearching && searchQuery && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
            <Search className="w-4 h-4" />
            <span>
              Showing results for{" "}
              <span className="font-semibold">"{searchQuery}"</span>
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      {columns.map((col) => (
                        <td key={col.key} className="px-6 py-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers && teachers.length > 0 ? (
                    teachers.map((teacher) => renderRow(teacher))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Users className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500">
                            {isSearching
                              ? `No teachers found matching "${searchQuery}"`
                              : "No teachers found in the system."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && teachers.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalRecords}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      {selectedTeacher && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          size="lg"
        >
          <ModalHeader
            icon={<Users className="w-6 h-6 text-purple-600" />}
            title="Teacher Details"
            subtitle={selectedTeacher.name}
            onClose={() => setShowViewModal(false)}
          />
          <ModalBody>
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {selectedTeacher.isActive ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Active Teacher
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">
                        Inactive Teacher
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Personal Information
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div className="flex items-start space-x-3 py-3 px-4">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        Full Name
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {selectedTeacher.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 py-3 px-4">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTeacher.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 py-3 px-4">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">CNIC</p>
                      <p className="mt-1 text-sm text-gray-900 font-mono">
                        {selectedTeacher.cnic}
                      </p>
                    </div>
                  </div>
                  {selectedTeacher.phoneNumber && (
                    <div className="flex items-start space-x-3 py-3 px-4">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          Phone
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedTeacher.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Professional Details
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {selectedTeacher.qualification && (
                    <div className="flex items-start space-x-3 py-3 px-4">
                      <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          Qualification
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedTeacher.qualification}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTeacher.experience !== undefined && (
                    <div className="flex items-start space-x-3 py-3 px-4">
                      <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          Experience
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedTeacher.experience} years
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTeacher.college && (
                    <div className="flex items-start space-x-3 py-3 px-4">
                      <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">
                          Assigned College
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {selectedTeacher.college.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedTeacher.college.code}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default TeachersPage;
