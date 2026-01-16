import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Edit,
  Eye,
  Key,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  MapPin,
  Mail,
  CreditCard,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { Skeleton } from "../../components/ui/Skeleton";
import AddDistrictHeadModal from "../../components/districtHeads/AddDistrictHeadModal";
import EditDistrictHeadModal from "../../components/districtHeads/EditDistrictHeadModal";
import ViewDistrictHeadModal from "../../components/districtHeads/ViewDistrictHeadModal";
import {
  districtHeadService,
  type DistrictHead,
} from "../../services/districtHead.service";
import { useToast } from "../../hooks/useToast";

const DistrictHeadsPage: React.FC = () => {
  const [districtHeads, setDistrictHeads] = useState<DistrictHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDistrictHead, setSelectedDistrictHead] =
    useState<DistrictHead | null>(null);
  const [showPasswordResetConfirm, setShowPasswordResetConfirm] =
    useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const { success, error: showError } = useToast();
  const itemsPerPage = 10;

  // Fetch district heads
  const fetchDistrictHeads = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (searchQuery.trim()) {
        setIsSearching(true);
        response = await districtHeadService.search(
          searchQuery,
          currentPage,
          itemsPerPage
        );
      } else {
        setIsSearching(false);
        response = await districtHeadService.getAll(currentPage, itemsPerPage);
      }

      setDistrictHeads(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalRecords(response.total || 0);
    } catch (err: any) {
      console.error("Failed to fetch district heads:", err);
      showError(err.response?.data?.message || "Failed to load district heads");
      setDistrictHeads([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, showError]);

  useEffect(() => {
    fetchDistrictHeads();
  }, [fetchDistrictHeads]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchDistrictHeads();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle add success
  const handleAddSuccess = async () => {
    success("District Head created successfully!");
    setSearchQuery("");
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (currentPage === 1 && searchQuery === "") {
      fetchDistrictHeads();
    } else {
      setCurrentPage(1);
    }
  };

  // Handle edit success
  const handleEditSuccess = async () => {
    success("District Head updated successfully!");
    await new Promise((resolve) => setTimeout(resolve, 100));
    fetchDistrictHeads();
  };

  // Handle view
  const handleView = async (districtHead: DistrictHead) => {
    try {
      // Extract userId - handle both string and populated object cases
      const userId =
        typeof districtHead.userId === "string"
          ? districtHead.userId
          : districtHead.userId._id;

      const fullData = await districtHeadService.getById(userId);
      setSelectedDistrictHead(fullData);
      setShowViewModal(true);
    } catch (err: any) {
      console.error("Failed to fetch district head details:", err);
      showError(err.response?.data?.message || "Failed to load details");
    }
  };

  // Handle edit
  const handleEdit = (districtHead: DistrictHead) => {
    setSelectedDistrictHead(districtHead);
    setShowEditModal(true);
  };

  // Handle password reset
  const handlePasswordReset = (districtHead: DistrictHead) => {
    setSelectedDistrictHead(districtHead);
    setShowPasswordResetConfirm(true);
  };

  const confirmPasswordReset = async () => {
    if (!selectedDistrictHead) return;

    try {
      setResetPasswordLoading(true);
      const response = await districtHeadService.resetPassword(
        selectedDistrictHead._id
      );

      // Show success with password in console (more secure)
      console.log("New Password:", response.newPassword);
      success(
        `Password reset successful! New password: ${response.newPassword}. Check console for details.`
      );
      setShowPasswordResetConfirm(false);
    } catch (err: any) {
      console.error("Failed to reset password:", err);
      showError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // Handle CSV export
  const handleExport = async (includePassword: boolean) => {
    try {
      setExportLoading(true);
      const blob = await districtHeadService.exportCSV(includePassword);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `district-heads-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success("District Heads exported successfully!");
    } catch (err: any) {
      console.error("Failed to export:", err);
      showError(err.response?.data?.message || "Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  // Table columns
  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "cnic", header: "CNIC" },
    { key: "region", header: "Region" },
    { key: "status", header: "Status" },
    { key: "actions", header: "Actions" },
  ];

  // Render row
  const renderRow = (districtHead: DistrictHead) => (
    <tr
      key={districtHead._id}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => handleView(districtHead)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {districtHead.name}
            </p>
            {districtHead.phoneNumber && (
              <p className="text-xs text-gray-500">
                {districtHead.phoneNumber}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{districtHead.email}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 font-mono">
            {districtHead.cnic}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        {typeof districtHead.regionId === "object" && districtHead.regionId ? (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {districtHead.regionId.name}
              </p>
              <p className="text-xs text-gray-500">
                {districtHead.regionId.code}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">Not assigned</span>
        )}
      </td>
      <td className="px-6 py-4">
        {districtHead.isActive ? (
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
            onClick={() => handleView(districtHead)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(districtHead)}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePasswordReset(districtHead)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Reset Password"
          >
            <Key className="w-4 h-4" />
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
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                District Heads
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage district head accounts and assignments
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Button
                variant="secondary"
                onClick={() => handleExport(false)}
                isLoading={exportLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                <button
                  onClick={() => handleExport(false)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Standard Export
                </button>
                <button
                  onClick={() => handleExport(true)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-t"
                >
                  With Password Reset
                </button>
              </div>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add District Head
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
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
                  {districtHeads && districtHeads.length > 0 ? (
                    districtHeads.map((dh) => renderRow(dh))
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
                              ? `No district heads found matching "${searchQuery}"`
                              : "No district heads found. Add your first district head to get started."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && districtHeads.length > 0 && (
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

      {/* Modals */}
      <AddDistrictHeadModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {selectedDistrictHead && (
        <>
          <EditDistrictHeadModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedDistrictHead(null);
            }}
            onSuccess={handleEditSuccess}
            districtHead={selectedDistrictHead}
          />

          <ViewDistrictHeadModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedDistrictHead(null);
            }}
            districtHead={selectedDistrictHead}
          />
        </>
      )}

      {/* Password Reset Confirmation Modal */}
      {showPasswordResetConfirm && selectedDistrictHead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Key className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Reset Password
                </h3>
                <p className="text-sm text-gray-500">Confirm password reset</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to reset the password for{" "}
              <span className="font-semibold">{selectedDistrictHead.name}</span>
              ? A new random password will be generated.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPasswordResetConfirm(false);
                  setSelectedDistrictHead(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPasswordReset}
                isLoading={resetPasswordLoading}
              >
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictHeadsPage;
