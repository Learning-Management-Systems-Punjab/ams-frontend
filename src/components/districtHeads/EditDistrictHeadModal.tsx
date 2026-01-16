import React, { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { Modal } from "../ui/Modal";
import { ModalHeader, ModalBody, ModalFooter } from "../ui/ModalParts";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Switch } from "../ui/Switch";
import { Button } from "../ui/Button";
import {
  districtHeadService,
  type UpdateDistrictHeadDto,
  type DistrictHead,
} from "../../services/districtHead.service";
import { regionService } from "../../services/region.service";

interface EditDistrictHeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  districtHead: DistrictHead;
}

interface FormData {
  name: string;
  email: string;
  cnic: string;
  phoneNumber: string;
  address: string;
  regionId: string;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  cnic?: string;
  phoneNumber?: string;
  regionId?: string;
}

interface Region {
  _id: string;
  name: string;
  code: string;
}

const EditDistrictHeadModal: React.FC<EditDistrictHeadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  districtHead,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    cnic: "",
    phoneNumber: "",
    address: "",
    regionId: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);

  // Initialize form with district head data
  useEffect(() => {
    if (isOpen && districtHead) {
      // Extract regionId - handle both string and populated object cases
      const regionId =
        typeof districtHead.regionId === "string"
          ? districtHead.regionId
          : districtHead.regionId?._id || "";

      setFormData({
        name: districtHead.name || "",
        email: districtHead.email || "",
        cnic: districtHead.cnic || "",
        phoneNumber: districtHead.phoneNumber || "",
        address: districtHead.address || "",
        regionId: regionId,
        isActive: districtHead.isActive ?? true,
      });
    }
  }, [isOpen, districtHead]);

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const response = await regionService.getAll(1, 100);
        setRegions(response.data || []);
      } catch (error) {
        console.error("Failed to load regions:", error);
      } finally {
        setLoadingRegions(false);
      }
    };

    if (isOpen) {
      fetchRegions();
    }
  }, [isOpen]);

  const validateField = (
    name: keyof FormData,
    value: string | boolean
  ): string => {
    const strValue = String(value);

    switch (name) {
      case "name":
        if (!strValue.trim()) return "Name is required";
        if (strValue.length < 3) return "Name must be at least 3 characters";
        if (strValue.length > 100) return "Name must not exceed 100 characters";
        return "";

      case "email":
        if (!strValue.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(strValue)) return "Invalid email format";
        return "";

      case "cnic":
        if (!strValue.trim()) return "CNIC is required";
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        if (!cnicRegex.test(strValue)) return "CNIC format: 12345-1234567-1";
        return "";

      case "phoneNumber":
        if (strValue && strValue.length > 0) {
          // Remove spaces and dashes for validation
          const cleanedValue = strValue.replace(/[-\s]/g, "");
          // Pakistani mobile format: 03XXXXXXXXX (11 digits) or +923XXXXXXXXX (13 digits with country code)
          const phoneRegex = /^(\+92|92|0)?3\d{9}$/;
          if (!phoneRegex.test(cleanedValue)) {
            return "Invalid phone number format (e.g., 03XX-XXXXXXX)";
          }
        }
        return "";

      case "regionId":
        if (!strValue) return "Region is required";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Auto-format CNIC
    if (name === "cnic") {
      processedValue = value
        .replace(/\D/g, "")
        .replace(/^(\d{5})(\d{7})(\d{1}).*/, "$1-$2-$3")
        .substring(0, 15);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.name = validateField("name", formData.name);
    newErrors.email = validateField("email", formData.email);
    newErrors.cnic = validateField("cnic", formData.cnic);
    newErrors.phoneNumber = validateField("phoneNumber", formData.phoneNumber);
    newErrors.regionId = validateField("regionId", formData.regionId);

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const submitData: UpdateDistrictHeadDto = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        cnic: formData.cnic.trim(),
        regionId: formData.regionId,
        isActive: formData.isActive,
      };

      if (formData.phoneNumber.trim()) {
        submitData.phoneNumber = formData.phoneNumber.trim();
      }

      if (formData.address.trim()) {
        submitData.address = formData.address.trim();
      }

      await districtHeadService.update(districtHead._id, submitData);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Failed to update district head:", error);

      // Handle validation errors from backend
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const backendErrors = error.response.data.errors;
        const fieldErrors: FormErrors = {};
        const errorMessages: string[] = [];

        backendErrors.forEach((err: { field: string; message: string }) => {
          // Map backend field names to form field names
          const fieldMap: { [key: string]: keyof FormErrors } = {
            name: "name",
            email: "email",
            cnic: "cnic",
            phoneNumber: "phoneNumber",
            contactNumber: "phoneNumber",
            regionId: "regionId",
          };

          const mappedField = fieldMap[err.field];
          if (mappedField) {
            fieldErrors[mappedField] = err.message;
          }
          errorMessages.push(`${err.field}: ${err.message}`);
        });

        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        setServerError(
          error.response?.data?.message || errorMessages.join(", ")
        );
      } else {
        setServerError(
          error.response?.data?.message ||
            "Failed to update district head. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setServerError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          icon={<Edit className="w-6 h-6 text-primary-600" />}
          title="Edit District Head"
          subtitle={`Update information for ${districtHead?.name || ""}`}
          onClose={handleClose}
        />

        <ModalBody>
          <div className="space-y-5">
            {/* Server Error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{serverError}</p>
                    {Object.keys(errors).length > 0 && (
                      <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                        {Object.entries(errors).map(
                          ([field, error]) =>
                            error && (
                              <li key={field}>
                                <span className="font-medium capitalize">
                                  {field}:
                                </span>{" "}
                                {error}
                              </li>
                            )
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Name */}
            <FormField
              label="Full Name"
              required
              error={errors.name}
              description="Enter the full name of the district head"
            >
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Muhammad Ali Khan"
                error={errors.name}
                maxLength={100}
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email Address"
              required
              error={errors.email}
              description="Official email address for login"
            >
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., ali.khan@punjabcolleges.edu.pk"
                error={errors.email}
              />
            </FormField>

            {/* CNIC */}
            <FormField
              label="CNIC"
              required
              error={errors.cnic}
              description="13-digit national identity card number"
            >
              <Input
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="12345-1234567-1"
                error={errors.cnic}
                maxLength={15}
              />
            </FormField>

            {/* Phone Number */}
            <FormField
              label="Phone Number"
              error={errors.phoneNumber}
              description="Optional contact number"
            >
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., 03001234567"
                error={errors.phoneNumber}
              />
            </FormField>

            {/* Region Selection */}
            <FormField
              label="Assigned Region"
              required
              error={errors.regionId}
              description="Select the region to assign"
            >
              <select
                name="regionId"
                value={formData.regionId}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loadingRegions}
                className={`w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.regionId
                    ? "border-red-500"
                    : "border-gray-300 hover:border-gray-400"
                } ${
                  loadingRegions ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
              >
                <option value="">
                  {loadingRegions ? "Loading regions..." : "Select a region"}
                </option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name} ({region.code})
                  </option>
                ))}
              </select>
            </FormField>

            {/* Address */}
            <FormField
              label="Address"
              description="Optional residential address (max 500 characters)"
            >
              <Textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address..."
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {formData.address.length}/500 characters
              </div>
            </FormField>

            {/* Active Status */}
            <FormField
              label="Active Status"
              description="Enable or disable this district head's account"
            >
              <div className="flex items-center space-x-3">
                <Switch
                  checked={formData.isActive}
                  onChange={handleSwitchChange}
                />
                <span className="text-sm text-gray-700">
                  {formData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </FormField>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={loadingRegions}
          >
            {isSubmitting ? "Updating..." : "Update District Head"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default EditDistrictHeadModal;
