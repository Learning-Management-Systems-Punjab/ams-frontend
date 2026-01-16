import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Search,
  Eye,
  MapPin,
  CheckCircle,
  XCircle,
  Filter,
  Plus,
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
import {
  collegeService,
  type College,
  type CollegeCreateResponse,
} from "../../services/college.service";
import { useToast } from "../../hooks/useToast";
import { AddCollegeModal } from "../../components/colleges/AddCollegeModal";
import { CredentialsModal } from "../../components/colleges/CredentialsModal";

const CollegesPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [collegeCredentials, setCollegeCredentials] =
    useState<CollegeCreateResponse | null>(null);

  const { error: showError, success } = useToast();
  const itemsPerPage = 10;

  // Fetch colleges
  const fetchColleges = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (searchQuery.trim()) {
        setIsSearching(true);
        response = await collegeService.search(
          searchQuery,
          currentPage,
          itemsPerPage
        );
      } else {
        setIsSearching(false);
        response = await collegeService.getAll(currentPage, itemsPerPage);
      }

      setColleges(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.total || 0);
    } catch (err: any) {
      console.error("Failed to fetch colleges:", err);
      showError(err.response?.data?.message || "Failed to load colleges");
      setColleges([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, showError]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchColleges();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle view
  const handleView = async (college: College) => {
    try {
      const fullData = await collegeService.getById(college._id);
      setSelectedCollege(fullData);
      setShowViewModal(true);
    } catch (err: any) {
      console.error("Failed to fetch college details:", err);
      showError(err.response?.data?.message || "Failed to load details");
    }
  };

  // Handle add success
  const handleAddSuccess = (response: CollegeCreateResponse) => {
    success("College created successfully!");
    setCollegeCredentials(response);
    setShowCredentialsModal(true);
    fetchColleges();
  };

  // Table columns
  const columns = [
    { key: "name", header: "College Name" },
    { key: "code", header: "Code" },
    { key: "city", header: "City" },
    { key: "region", header: "Region" },
    { key: "status", header: "Status" },
    { key: "actions", header: "Actions" },
  ];

  // Render row
  const renderRow = (college: College) => (
    <tr
      key={college._id}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => handleView(college)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{college.name}</p>
            {college.address && (
              <p className="text-xs text-gray-500 line-clamp-1">
                {college.address}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {college.code}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{college.city}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {typeof college.regionId === "object" && college.regionId ? (
          <div>
            <p className="text-sm font-medium text-gray-900">
              {college.regionId.name}
            </p>
            <p className="text-xs text-gray-500">{college.regionId.code}</p>
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">Not assigned</span>
        )}
      </td>
      <td className="px-6 py-4">
        {college.isActive ? (
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
            onClick={() => handleView(college)}
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
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Colleges</h1>
              <p className="text-sm text-gray-500 mt-1">
                View and manage all colleges in the system
              </p>
            </div>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add College
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, code, or city..."
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

        {/* Search indicator */}
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
                  {colleges && colleges.length > 0 ? (
                    colleges.map((college) => renderRow(college))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Building2 className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500">
                            {isSearching
                              ? `No colleges found matching "${searchQuery}"`
                              : "No colleges found in the system."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && colleges.length > 0 && (
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
      {selectedCollege && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          size="lg"
        >
          <ModalHeader
            icon={<Building2 className="w-6 h-6 text-primary-600" />}
            title="College Details"
            subtitle={selectedCollege.name}
            onClose={() => setShowViewModal(false)}
          />
          <ModalBody>
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {selectedCollege.isActive ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Active College
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">
                        Inactive College
                      </span>
                    </>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  Code: {selectedCollege.code}
                </span>
              </div>

              {/* College Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  College Information
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                  <div className="flex items-start space-x-3 py-3 px-4">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        College Name
                      </p>
                      <p className="mt-1 text-sm font-semibold text-primary-600">
                        {selectedCollege.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 py-3 px-4">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        Location
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCollege.city}
                      </p>
                      {selectedCollege.address && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {selectedCollege.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Region Information */}
              {selectedCollege.region && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Region Assignment
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Assigned Region
                      </span>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                        {selectedCollege.region.code}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {selectedCollege.region.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Add College Modal */}
      <AddCollegeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Credentials Modal */}
      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        credentials={collegeCredentials}
      />
    </div>
  );
};

export default CollegesPage;
