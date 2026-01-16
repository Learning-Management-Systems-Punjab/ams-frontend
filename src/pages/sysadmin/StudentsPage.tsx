import React, { useState, useEffect, useCallback } from "react";
import { GraduationCap, Search, Eye, Mail, CreditCard, CheckCircle, XCircle, Filter, BookOpen } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { Skeleton } from "../../components/ui/Skeleton";
import { Modal } from "../../components/ui/Modal";
import { ModalHeader, ModalBody, ModalFooter } from "../../components/ui/ModalParts";
import { studentService, type Student } from "../../services/student.service";
import { useToast } from "../../hooks/useToast";

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { error: showError } = useToast();
  const itemsPerPage = 10;

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (searchQuery.trim()) {
        setIsSearching(true);
        response = await studentService.search(searchQuery, currentPage, itemsPerPage);
      } else {
        setIsSearching(false);
        response = await studentService.getAll(currentPage, itemsPerPage);
      }
      setStudents(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.total || 0);
    } catch (err: any) {
      showError(err.response?.data?.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, showError]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchStudents();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleView = async (student: Student) => {
    try {
      const fullData = await studentService.getById(student._id);
      setSelectedStudent(fullData);
      setShowViewModal(true);
    } catch (err: any) {
      showError(err.response?.data?.message || "Failed to load details");
    }
  };

  const columns = [
    { key: "name", header: "Student Name" },
    { key: "rollNumber", header: "Roll Number" },
    { key: "email", header: "Email" },
    { key: "program", header: "Program" },
    { key: "section", header: "Section" },
    { key: "status", header: "Status" },
    { key: "actions", header: "Actions" },
  ];

  const renderRow = (student: Student) => (
    <tr key={student._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleView(student)}>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">{student.name}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {student.rollNumber}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{student.email}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {student.program ? (
          <div>
            <p className="text-sm font-medium text-gray-900">{student.program.name}</p>
            <p className="text-xs text-gray-500">{student.program.code}</p>
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">Not assigned</span>
        )}
      </td>
      <td className="px-6 py-4">
        {student.section ? (
          <span className="text-sm text-gray-900">{student.section.name}</span>
        ) : (
          <span className="text-sm text-gray-500 italic">N/A</span>
        )}
      </td>
      <td className="px-6 py-4">
        {student.isActive ? (
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
        <button
          onClick={(e) => { e.stopPropagation(); handleView(student); }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Students</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage all students</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, roll number, email, or CNIC..."
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
            <span>Showing results for <span className="font-semibold">"{searchQuery}"</span></span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students && students.length > 0 ? (
                    students.map((student) => renderRow(student))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-12 text-center">
                        <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          {isSearching ? `No students found matching "${searchQuery}"` : "No students found."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && students.length > 0 && (
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

      {selectedStudent && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} size="lg">
          <ModalHeader
            icon={<GraduationCap className="w-6 h-6 text-blue-600" />}
            title="Student Details"
            subtitle={selectedStudent.name}
            onClose={() => setShowViewModal(false)}
          />
          <ModalBody>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {selectedStudent.isActive ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Active Student</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Inactive Student</span>
                    </>
                  )}
                </div>
                <span className="text-xs text-gray-500">Roll: {selectedStudent.rollNumber}</span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Personal Information</h4>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div className="flex items-start space-x-3 py-3 px-4">
                    <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{selectedStudent.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 py-3 px-4">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 py-3 px-4">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">CNIC</p>
                      <p className="mt-1 text-sm font-mono text-gray-900">{selectedStudent.cnic}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Academic Information</h4>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {selectedStudent.program && (
                    <div className="flex items-start space-x-3 py-3 px-4">
                      <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Program</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{selectedStudent.program.name}</p>
                        <p className="text-xs text-gray-500">{selectedStudent.program.code}</p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.section && (
                    <div className="flex items-start space-x-3 py-3 px-4">
                      <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Section</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedStudent.section.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default StudentsPage;
