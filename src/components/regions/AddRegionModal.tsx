import React, { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { ModalHeader, ModalBody, ModalFooter } from "../ui/ModalParts";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Switch } from "../ui/Switch";
import { Button } from "../ui/Button";
import type { CreateRegionDto } from "../../services/region.service";

interface AddRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (data: CreateRegionDto) => Promise<void>;
}

interface FormData {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  code?: string;
  description?: string;
}

export const AddRegionModal: React.FC<AddRegionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Region name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Region name must be at least 3 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Region name must not exceed 100 characters";
    }

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = "Region code is required";
    } else if (!/^[A-Z0-9-_]+$/.test(formData.code.trim())) {
      newErrors.code =
        "Code must contain only uppercase letters, numbers, hyphens, and underscores";
    } else if (formData.code.trim().length < 2) {
      newErrors.code = "Region code must be at least 2 characters";
    } else if (formData.code.trim().length > 20) {
      newErrors.code = "Region code must not exceed 20 characters";
    }

    // Description validation (optional but with max length)
    if (
      formData.description.trim() &&
      formData.description.trim().length > 500
    ) {
      newErrors.description = "Description must not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData: CreateRegionDto = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || undefined,
      };

      await onSubmit(submitData);
      handleClose();
      onSuccess();
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.data?.message) {
        if (error.response.data.message.includes("code")) {
          setErrors({ code: error.response.data.message });
        } else if (error.response.data.message.includes("name")) {
          setErrors({ name: error.response.data.message });
        } else {
          alert(error.response.data.message);
        }
      } else {
        alert("Failed to create region. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        code: "",
        description: "",
        isActive: true,
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Add New Region"
          subtitle="Create a new geographic region in the system"
          onClose={handleClose}
          icon={<MapPin className="w-6 h-6 text-primary-600" />}
        />

        <ModalBody>
          <div className="space-y-5">
            {/* Region Name */}
            <FormField
              label="Region Name"
              required
              error={errors.name}
              description="Enter the full name of the region"
            >
              <Input
                type="text"
                name="name"
                placeholder="e.g., Punjab Region"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                disabled={isSubmitting}
                autoFocus
              />
            </FormField>

            {/* Region Code */}
            <FormField
              label="Region Code"
              required
              error={errors.code}
              description="Unique identifier using uppercase letters, numbers, and hyphens"
            >
              <Input
                type="text"
                name="code"
                placeholder="e.g., PB-01"
                value={formData.code}
                onChange={(e) => {
                  // Auto-uppercase the code
                  const uppercased = e.target.value.toUpperCase();
                  setFormData((prev) => ({ ...prev, code: uppercased }));
                  if (errors.code) {
                    setErrors((prev) => ({ ...prev, code: undefined }));
                  }
                }}
                error={errors.code}
                disabled={isSubmitting}
                maxLength={20}
              />
            </FormField>

            {/* Description */}
            <FormField
              label="Description"
              error={errors.description}
              description="Provide additional details about this region (optional)"
            >
              <Textarea
                name="description"
                placeholder="Enter a description for the region..."
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                disabled={isSubmitting}
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-400">
                  {formData.description.length}/500
                </span>
              </div>
            </FormField>

            {/* Active Status */}
            <FormField label="Status">
              <Switch
                checked={formData.isActive}
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
                label={formData.isActive ? "Active" : "Inactive"}
                description={
                  formData.isActive
                    ? "Region is active and visible to users"
                    : "Region is inactive and hidden from users"
                }
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            icon={
              isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : undefined
            }
          >
            {isSubmitting ? "Creating..." : "Create Region"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
