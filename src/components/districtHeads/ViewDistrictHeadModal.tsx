import React from "react";
import {
  Eye,
  Mail,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { ModalHeader, ModalBody, ModalFooter } from "../ui/ModalParts";
import { Button } from "../ui/Button";
import type { DistrictHead } from "../../services/districtHead.service";

interface ViewDistrictHeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  districtHead: DistrictHead | null;
}

const ViewDistrictHeadModal: React.FC<ViewDistrictHeadModalProps> = ({
  isOpen,
  onClose,
  districtHead,
}) => {
  if (!districtHead) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const DetailRow = ({
    icon: Icon,
    label,
    value,
    highlight = false,
  }: {
    icon: any;
    label: string;
    value: string | React.ReactNode;
    highlight?: boolean;
  }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p
          className={`mt-1 text-sm ${
            highlight ? "font-semibold text-primary-600" : "text-gray-900"
          }`}
        >
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </p>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader
        icon={<Eye className="w-6 h-6 text-primary-600" />}
        title="District Head Details"
        subtitle={`Complete information for ${districtHead.name}`}
        onClose={onClose}
      />

      <ModalBody>
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {districtHead.isActive ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Active Account
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    Inactive Account
                  </span>
                </>
              )}
            </div>
            <span className="text-xs text-gray-500">
              ID: {districtHead._id.substring(0, 8)}...
            </span>
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Personal Information
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              <DetailRow
                icon={Shield}
                label="Full Name"
                value={districtHead.name}
                highlight
              />
              <DetailRow
                icon={Mail}
                label="Email Address"
                value={districtHead.email}
              />
              <DetailRow
                icon={CreditCard}
                label="CNIC"
                value={districtHead.cnic}
              />
              <DetailRow
                icon={Phone}
                label="Phone Number"
                value={districtHead.phoneNumber}
              />
              <DetailRow
                icon={MapPin}
                label="Address"
                value={districtHead.address}
              />
            </div>
          </div>

          {/* Assignment Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Assignment Details
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              {typeof districtHead.regionId === "object" &&
              districtHead.regionId ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Assigned Region
                    </span>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                      {districtHead.regionId.code}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {districtHead.regionId.name}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No region assigned
                </p>
              )}
            </div>
          </div>

          {/* Account Information */}
          {districtHead.user && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Account Information
              </h4>
              <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                <DetailRow
                  icon={Shield}
                  label="User Role"
                  value={
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {districtHead.user.role}
                    </span>
                  }
                />
                <DetailRow
                  icon={Mail}
                  label="Login Email"
                  value={districtHead.user.email}
                />
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Record Information
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              <DetailRow
                icon={Calendar}
                label="Created At"
                value={formatDate(districtHead.createdAt)}
              />
              <DetailRow
                icon={Calendar}
                label="Last Updated"
                value={formatDate(districtHead.updatedAt)}
              />
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewDistrictHeadModal;
