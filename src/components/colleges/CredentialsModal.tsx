import React from "react";
import { CheckCircle, Copy, Eye, EyeOff } from "lucide-react";
import { Modal } from "../ui/Modal";
import { ModalHeader, ModalBody, ModalFooter } from "../ui/ModalParts";
import { Button } from "../ui/Button";
import type { CollegeCreateResponse } from "../../services/college.service";

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: CollegeCreateResponse | null;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  credentials,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [copied, setCopied] = React.useState<"email" | "password" | null>(null);

  if (!credentials) return null;

  const handleCopy = (text: string, type: "email" | "password") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    setShowPassword(false);
    setCopied(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader
        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
        title="College Created Successfully!"
        onClose={handleClose}
      />

      <ModalBody>
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>{credentials.college.name}</strong> has been created
              successfully. A College Admin account has been created with the
              following credentials:
            </p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ Important: Save these credentials securely. The password will
              not be shown again.
            </p>
          </div>

          {/* Credentials */}
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Username)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm">
                  {credentials.credentials.email}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(credentials.credentials.email, "email")
                  }
                  className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Copy email"
                >
                  {copied === "email" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm">
                  {showPassword
                    ? credentials.credentials.password
                    : "••••••••••••"}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(credentials.credentials.password, "password")
                  }
                  className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Copy password"
                >
                  {copied === "password" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* College Info */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              College Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">College Code:</span>
                <p className="font-mono font-medium text-gray-900">
                  {credentials.college.code}
                </p>
              </div>
              <div>
                <span className="text-gray-500">City:</span>
                <p className="font-medium text-gray-900">
                  {credentials.college.city}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Next Steps:</strong>
              <br />
              1. Share these credentials with the College Admin securely
              <br />
              2. Advise them to change their password after first login
              <br />
              3. They can access the system at the College Admin portal
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button onClick={handleClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};
