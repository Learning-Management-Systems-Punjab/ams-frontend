import React from "react";
import { X } from "lucide-react";

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  icon?: React.ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  onClose,
  icon,
}) => {
  return (
    <div className="relative pb-4 border-b border-gray-200">
      <div className="flex items-start space-x-3">
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Close modal"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = "",
}) => {
  return <div className={`py-6 ${className}`}>{children}</div>;
};
