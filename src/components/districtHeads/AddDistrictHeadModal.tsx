import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { Modal } from "../ui/Modal";
import { ModalHeader, ModalBody, ModalFooter } from "../ui/ModalParts";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import {
  districtHeadService,
  type CreateDistrictHeadDto,
} from "../../services/districtHead.service";
import { regionService } from "../../services/region.service";

interface AddDistrictHeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  cnic: string;
  phoneNumber: string;
  address: string;
  gender: string;
  regionId: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  cnic?: string;
  phoneNumber?: string;
  gender?: string;
  regionId?: string;
}

interface Region {
  _id: string;
  name: string;
  code: string;
}

const AddDistrictHeadModal: React.FC<AddDistrictHeadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    cnic: "",
    phoneNumber: "",
    address: "",
    gender: "",
    regionId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const response = await regionService.getAll(1, 100); // Get first 100 regions
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

  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.length < 3) return "Name must be at least 3 characters";
        if (value.length > 100) return "Name must not exceed 100 characters";
        return "";

      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Invalid email format";
        return "";

      case "password":
        if (!value.trim()) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";

      case "cnic":
        if (!value.trim()) return "CNIC is required";
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        if (!cnicRegex.test(value)) return "CNIC format: 12345-1234567-1";
        return "";

      case "phoneNumber":
        if (value && value.length > 0) {
          // Remove spaces and dashes for validation
          const cleanedValue = value.replace(/[-\s]/g, "");
          // Pakistani mobile format: 03XXXXXXXXX (11 digits) or +923XXXXXXXXX (13 digits with country code)
          const phoneRegex = /^(\+92|92|0)?3\d{9}$/;
          if (!phoneRegex.test(cleanedValue)) {
            return "Invalid phone number format (e.g., 03XX-XXXXXXX)";
          }
        }
        return "";

      case "gender":
        if (!value) return "Gender is required";
        if (!["Male", "Female", "Other"].includes(value)) {
          return "Gender must be Male, Female, or Other";
        }
        return "";

      case "regionId":
        if (!value) return "Region is required";
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
    newErrors.password = validateField("password", formData.password);
    newErrors.cnic = validateField("cnic", formData.cnic);
    newErrors.phoneNumber = validateField("phoneNumber", formData.phoneNumber);
    newErrors.gender = validateField("gender", formData.gender);
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
      const submitData: CreateDistrictHeadDto = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
        cnic: formData.cnic.trim(),
        gender: formData.gender,
        regionId: formData.regionId,
      };

      if (formData.phoneNumber.trim()) {
        submitData.phoneNumber = formData.phoneNumber.trim();
      }

      if (formData.address.trim()) {
        submitData.address = formData.address.trim();
      }

      console.log("Submitting district head data:", submitData);

      await districtHeadService.create(submitData);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Failed to create district head:", error);
      console.log("Full error response:", error.response);
      console.log("Error data:", error.response?.data);
      console.log("Error status:", error.response?.status);

      // Handle validation errors from backend
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const backendErrors = error.response.data.errors;
        const fieldErrors: FormErrors = {};
        const errorMessages: string[] = [];

        console.log("Backend validation errors:", backendErrors);

        backendErrors.forEach((err: { field: string; message: string }) => {
          // Map backend field names to form field names
          const fieldMap: { [key: string]: keyof FormErrors } = {
            name: "name",
            email: "email",
            password: "password",
            cnic: "cnic",
            phoneNumber: "phoneNumber",
            contactNumber: "phoneNumber",
            gender: "gender",
            regionId: "regionId",
          };

          const mappedField = fieldMap[err.field];
          if (mappedField) {
            fieldErrors[mappedField] = err.message;
          }
          errorMessages.push(`${err.field}: ${err.message}`);
        });

        setErrors((prev) => ({ ...prev, ...fieldErrors }));

        // Show detailed error message with all field errors
        const detailedMessage =
          errorMessages.length > 0
            ? `Validation failed:\n${errorMessages
                .map((msg) => `• ${msg}`)
                .join("\n")}`
            : error.response?.data?.message || "Validation failed";

        setServerError(detailedMessage);
      } else {
        setServerError(
          error.response?.data?.message ||
            "Failed to create district head. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      cnic: "",
      phoneNumber: "",
      address: "",
      gender: "",
      regionId: "",
    });
    setErrors({});
    setServerError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          icon={<UserPlus className="w-6 h-6 text-primary-600" />}
          title="Add New District Head"
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
                    <p className="text-sm font-medium whitespace-pre-line">
                      {serverError}
                    </p>
                    {Object.keys(errors).length > 0 && (
                      <ul className="mt-2 text-sm space-y-1">
                        {Object.entries(errors).map(
                          ([field, error]) =>
                            error && (
                              <li key={field} className="flex items-start">
                                <span className="inline-block mr-2">•</span>
                                <span>
                                  <span className="font-medium capitalize">
                                    {field}:
                                  </span>{" "}
                                  {error}
                                </span>
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

            {/* Password */}
            <FormField
              label="Password"
              required
              error={errors.password}
              description="Minimum 6 characters"
            >
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter password"
                error={errors.password}
                minLength={6}
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

            {/* Gender */}
            <FormField
              label="Gender"
              required
              error={errors.gender}
              description="Select gender"
            >
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.gender
                    ? "border-red-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
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
            {isSubmitting ? "Creating..." : "Create District Head"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default AddDistrictHeadModal;
