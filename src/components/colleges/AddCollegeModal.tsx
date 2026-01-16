import React, { useState, useEffect } from "react";
import { Building2, AlertCircle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { ModalHeader, ModalBody, ModalFooter } from "../ui/ModalParts";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { FormField } from "../ui/FormField";
import {
  collegeService,
  type CreateCollegeDto,
  type CollegeCreateResponse,
} from "../../services/college.service";
import { regionService, type Region } from "../../services/region.service";

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (response: CollegeCreateResponse) => void;
}

interface FormData {
  name: string;
  code: string;
  regionId: string;
  address: string;
  city: string;
  establishedYear: string;
  password: string;
}

interface FormErrors {
  name?: string;
  code?: string;
  regionId?: string;
  address?: string;
  city?: string;
  establishedYear?: string;
  password?: string;
}

export const AddCollegeModal: React.FC<AddCollegeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    regionId: "",
    address: "",
    city: "",
    establishedYear: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // Fetch regions
  useEffect(() => {
    if (isOpen) {
      fetchRegions();
    }
  }, [isOpen]);

  const fetchRegions = async () => {
    try {
      setLoadingRegions(true);
      const response = await regionService.getAll(1, 100);
      setRegions(response.data || []);
    } catch (error) {
      console.error("Failed to fetch regions:", error);
    } finally {
      setLoadingRegions(false);
    }
  };

  // Generate email from college code
  const generateEmail = (code: string): string => {
    if (!code.trim()) return "";
    return `${code.trim().toLowerCase()}@decfsd.edu.pk`;
  };

  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "College name is required";
        if (value.trim().length < 3)
          return "College name must be at least 3 characters";
        if (value.trim().length > 200)
          return "College name must not exceed 200 characters";
        return "";

      case "code":
        if (!value.trim()) return "College code is required";
        if (!/^[A-Z0-9]+$/.test(value.trim()))
          return "Code must contain only uppercase letters and numbers";
        if (value.trim().length < 2 || value.trim().length > 10)
          return "Code must be between 2 and 10 characters";
        return "";

      case "regionId":
        if (!value) return "Region is required";
        return "";

      case "address":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 10)
          return "Address must be at least 10 characters";
        if (value.trim().length > 500)
          return "Address must not exceed 500 characters";
        return "";

      case "city":
        if (!value.trim()) return "City is required";
        if (value.trim().length < 2)
          return "City name must be at least 2 characters";
        if (value.trim().length > 100)
          return "City name must not exceed 100 characters";
        return "";

      case "establishedYear":
        if (value && !/^\d{4}$/.test(value))
          return "Year must be a 4-digit number";
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        if (value && (year < 1900 || year > currentYear))
          return `Year must be between 1900 and ${currentYear}`;
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
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

    // Auto-uppercase for code field
    const finalValue = name === "code" ? value.toUpperCase() : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
    newErrors.code = validateField("code", formData.code);
    newErrors.regionId = validateField("regionId", formData.regionId);
    newErrors.address = validateField("address", formData.address);
    newErrors.city = validateField("city", formData.city);
    newErrors.establishedYear = validateField(
      "establishedYear",
      formData.establishedYear
    );
    newErrors.password = validateField("password", formData.password);

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const generatedEmail = generateEmail(formData.code);

      const submitData: CreateCollegeDto = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        regionId: formData.regionId,
        address: formData.address.trim(),
        city: formData.city.trim(),
        email: generatedEmail,
        password: formData.password,
      };

      if (formData.establishedYear) {
        submitData.establishedYear = parseInt(formData.establishedYear);
      }

      console.log("Submitting college data:", submitData);

      const response = await collegeService.create(submitData);
      onSuccess(response);
      handleClose();
    } catch (error: any) {
      console.error("Failed to create college:", error);

      // Handle validation errors from backend
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const backendErrors = error.response.data.errors;
        const fieldErrors: FormErrors = {};
        const errorMessages: string[] = [];

        backendErrors.forEach((err: { field: string; message: string }) => {
          const fieldMap: { [key: string]: keyof FormErrors } = {
            name: "name",
            code: "code",
            regionId: "regionId",
            address: "address",
            city: "city",
            establishedYear: "establishedYear",
            password: "password",
          };

          const mappedField = fieldMap[err.field];
          if (mappedField) {
            fieldErrors[mappedField] = err.message;
          }
          // Show email errors in server error message since email is auto-generated
          errorMessages.push(`${err.field}: ${err.message}`);
        });

        setErrors((prev) => ({ ...prev, ...fieldErrors }));

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
            "Failed to create college. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      code: "",
      regionId: "",
      address: "",
      city: "",
      establishedYear: "",
      password: "",
    });
    setErrors({});
    setServerError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          icon={<Building2 className="w-6 h-6 text-blue-600" />}
          title="Add New College"
          onClose={handleClose}
        />

        <ModalBody>
          <div className="space-y-5">
            {/* Server Error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium whitespace-pre-line">
                      {serverError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* College Name */}
            <FormField
              label="College Name"
              required
              error={errors.name}
              description="Full official name of the college"
            >
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Government College University"
                error={errors.name}
                maxLength={200}
              />
            </FormField>

            {/* College Code */}
            <FormField
              label="College Code"
              required
              error={errors.code}
              description="Unique code (uppercase letters and numbers only)"
            >
              <Input
                name="code"
                value={formData.code}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., GCU001"
                error={errors.code}
                maxLength={10}
              />
            </FormField>

            {/* Region Selection */}
            <FormField
              label="Region"
              required
              error={errors.regionId}
              description="Select the region this college belongs to"
            >
              <select
                name="regionId"
                value={formData.regionId}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loadingRegions}
                className={`w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.regionId
                    ? "border-red-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <option value="">
                  {loadingRegions ? "Loading regions..." : "Select Region"}
                </option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name} ({region.code})
                  </option>
                ))}
              </select>
            </FormField>

            {/* City */}
            <FormField
              label="City"
              required
              error={errors.city}
              description="City where the college is located"
            >
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Lahore"
                error={errors.city}
                maxLength={100}
              />
            </FormField>

            {/* Address */}
            <FormField
              label="Address"
              required
              error={errors.address}
              description="Complete physical address"
            >
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter complete address"
                rows={3}
                maxLength={500}
                className={`w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.address
                    ? "border-red-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1">{errors.address}</p>
              )}
            </FormField>

            {/* Established Year */}
            <FormField
              label="Established Year"
              error={errors.establishedYear}
              description="Optional - Year the college was established"
            >
              <Input
                type="number"
                name="establishedYear"
                value={formData.establishedYear}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., 2005"
                error={errors.establishedYear}
                min={1900}
                max={new Date().getFullYear()}
              />
            </FormField>

            <div className="border-t border-gray-200 pt-5 mt-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase">
                College Admin Account
              </h4>

              {/* Auto-generated Email Display */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Auto-generated)
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Email will be automatically generated based on college code
                </p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm font-mono text-blue-900">
                    {formData.code.trim()
                      ? generateEmail(formData.code)
                      : "collegecode@decfsd.edu.pk"}
                  </code>
                </div>
                {!formData.code.trim() && (
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a college code above to see the generated email
                  </p>
                )}
              </div>

              {/* Password */}
              <FormField
                label="Password"
                required
                error={errors.password}
                description="Minimum 8 characters"
              >
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter password"
                  error={errors.password}
                  minLength={8}
                />
              </FormField>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create College"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
