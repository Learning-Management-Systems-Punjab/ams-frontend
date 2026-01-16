import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, Search, Eye, CheckCircle, XCircle, Award } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { Skeleton } from "../../components/ui/Skeleton";
import { Modal } from "../../components/ui/Modal";
import { ModalHeader, ModalBody, ModalFooter } from "../../components/ui/ModalParts";
import { subjectService, type Subject } from "../../services/subject.service";
import { useToast } from "../../hooks/useToast";

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const { error: showError } = useToast();
  const itemsPerPage = 10;

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (searchQuery.trim()) {
        setIsSearching(true);
        response = await subjectService.search(searchQuery, currentPage, itemsPerPage);
      } else {
        setIsSearching(false);
        response = await subjectService.getAll(currentPage, itemsPerPage);
      }
      setSubjects(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.total || 0);
    } catch (err: any) {
      showError(err.response?.data?.message || "Failed to load subjects");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, showError]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchSubjects();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleView = async (subject: Subject) => {
    try {
      const fullData = await subjectService.getById(subject._id);
      setSelectedSubject(fullData);
      setShowViewModal(true);
    } catch (err: any) {
      showError(err.response?.data?.message || "Failed to load details");
    }
  };

  const columns = [
    { key: "name", header: "Subject Name" },
    { key: "code", header: "Code" },
    { key: "credits", header: "Credits" },
    { key: "description", header: "Description" },
    { key: "status", header: "Status" },
    { key: "actions", header: "Actions" },
  ];

  const renderRow = (subject: Subject) => (
    <tr key={subject._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleView(subject)}>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">{subject.name}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-mono">
          {subject.code}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-semibold text-gray-900">{subject.credits}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600 truncate max-w-xs">
          {subject.description || <span className="italic text-gray-400">No description</span>}
        </p>
      </td>
      <td className="px-6 py-4">
        {subject.isActive ? (
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
          onClick={(e) => { e.stopPropagation(); handleView(subject); }}
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage all subjects</p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Input
            placeholder="Search by subject name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
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
                  {subjects && subjects.length > 0 ? (
                    subjects.map((subject) => renderRow(subject))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-12 text-center">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          {isSearching ? `No subjects found matching "${searchQuery}"` : "No subjects found."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && subjects.length > 0 && (
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

      {selectedSubject && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} size="md">
          <ModalHeader
            icon={<BookOpen className="w-6 h-6 text-emerald-600" />}
            title="Subject Details"
            subtitle={selectedSubject.name}
            onClose={() => setShowViewModal(false)}
          />
          <ModalBody>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {selectedSubject.isActive ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Active Subject</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Inactive Subject</span>
                    </>
                  )}
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <Award className="w-3 h-3 mr-1" />
                  {selectedSubject.credits} Credits
                </span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Subject Information</h4>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div className="flex items-start space-x-3 py-3 px-4">
                    <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Subject Name</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{selectedSubject.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 py-3 px-4">
                    <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Subject Code</p>
                      <p className="mt-1 text-sm font-mono text-gray-900">{selectedSubject.code}</p>
                    </div>
                  </div>
                  {selectedSubject.description && (
                    <div className="flex items-start space-x-3 py-3 px-4">
                      <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedSubject.description}</p>
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

export default SubjectsPage;
