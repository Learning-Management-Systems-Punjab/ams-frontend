import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Eye,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Pagination } from "../../components/ui/Pagination";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ToastContainer } from "../../components/ui/Toast";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  regionService,
  type Region,
  type CreateRegionDto,
} from "../../services/region.service";
import { AddRegionModal } from "../../components/regions/AddRegionModal";
import { useToast } from "../../hooks/useToast";

export const RegionsPage: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toasts, removeToast, success, error } = useToast();
  const itemsPerPage = 10;

  const fetchRegions = async () => {
    try {
      setLoading(true);
      console.log("Fetching regions:", {
        currentPage,
        itemsPerPage,
        searchQuery,
      });
      const response = await regionService.getAll(
        currentPage,
        itemsPerPage,
        searchQuery
      );
      console.log("Regions API response:", response);
      setRegions(response?.data || []);
      setTotalPages(response?.totalPages || 1);
      setTotalItems(response?.total || 0);
      console.log("Regions set:", response?.data || []);
    } catch (error: any) {
      console.error("Error fetching regions:", error);
      setRegions([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, [currentPage, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRowClick = (region: Region) => {
    setSelectedRegion(region);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await regionService.delete(deleteConfirmId);
      setDeleteConfirmId(null);
      fetchRegions();
      success("Region deleted successfully");
    } catch (err: any) {
      console.error("Error deleting region:", err);
      error(err.response?.data?.message || "Failed to delete region");
    }
  };

  const handleAddRegion = async (data: CreateRegionDto) => {
    await regionService.create(data);
  };

  const handleAddSuccess = async () => {
    success("Region created successfully!");

    // Clear search to ensure the new region is visible
    setSearchQuery("");

    // Small delay to ensure backend has committed the data
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Reset to page 1 to see the newly added region
    // This will trigger useEffect which calls fetchRegions()
    if (currentPage === 1 && searchQuery === "") {
      // If already on page 1 with no search, manually refresh
      fetchRegions();
    } else {
      // Otherwise, changing page/search will trigger the refresh
      setCurrentPage(1);
    }
  };

  const columns = [
    { key: "code", header: "Code" },
    { key: "name", header: "Region Name" },
    { key: "districtHeadId", header: "District Head" },
    { key: "status", header: "Status" },
    { key: "createdAt", header: "Created" },
    { key: "actions", header: "Actions" },
  ];

  const renderRow = (region: Region) => (
    <tr
      key={region._id}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => handleRowClick(region)}
    >
      <td className="px-6 py-4">
        <span className="font-mono font-semibold text-primary-600">
          {region.code}
        </span>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-gray-900">{region.name}</p>
          {region.description && (
            <p className="text-sm text-gray-500 truncate max-w-xs">
              {region.description}
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        {region.districtHeadId && typeof region.districtHeadId === "object" ? (
          <div>
            <p className="text-sm font-medium text-gray-900">
              {region.districtHeadId.name}
            </p>
            <p className="text-xs text-gray-500">
              {region.districtHeadId.email}
            </p>
          </div>
        ) : region.districtHeadId ? (
          <span className="text-gray-600">Assigned</span>
        ) : (
          <span className="text-gray-500 italic">Not Assigned</span>
        )}
      </td>
      <td className="px-6 py-4">
        {region.isActive ? (
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
        <span className="text-gray-600">
          {new Date(region.createdAt).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(region);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleDelete(region._id, e)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regions</h1>
          <p className="text-gray-600 mt-1">
            Manage geographic regions and districts
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Region
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search regions..."
            value={searchQuery}
            onChange={handleSearch}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
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
                  {regions && regions.length > 0 ? (
                    regions.map((region) => renderRow(region))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-6 py-12 text-center"
                      >
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? `No regions found matching "${searchQuery}"`
                            : "No regions found."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && regions.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Region Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Region Details"
        size="lg"
      >
        {selectedRegion && (
          <div className="space-y-6">
            {/* Header with Icon */}
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <MapPin className="w-8 h-8 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedRegion.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Code: {selectedRegion.code}
                </p>
              </div>
              <span
                className={`
                  inline-flex px-3 py-1 text-sm font-semibold rounded-full
                  ${
                    selectedRegion.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                `}
              >
                {selectedRegion.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Region Name
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {selectedRegion.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Region Code
                </label>
                <p className="mt-1 text-base font-mono text-gray-900">
                  {selectedRegion.code}
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {selectedRegion.description || "No description provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  District Head
                </label>
                <div className="mt-1 text-base text-gray-900">
                  {selectedRegion.districtHeadId &&
                  typeof selectedRegion.districtHeadId === "object" ? (
                    <div>
                      <p className="font-medium">
                        {selectedRegion.districtHeadId.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedRegion.districtHeadId.email}
                      </p>
                    </div>
                  ) : selectedRegion.districtHeadId ? (
                    <span>Assigned (ID: {selectedRegion.districtHeadId})</span>
                  ) : (
                    <span className="text-gray-500 italic">Not Assigned</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {selectedRegion.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Created At
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {new Date(selectedRegion.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="mt-1 text-base text-gray-900">
                  {new Date(selectedRegion.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => alert("Edit functionality coming soon!")}
              >
                Edit Region
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Region"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this region? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Region Modal */}
      <AddRegionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRegion}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};
