import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-600",
    textColor: "text-green-800",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    textColor: "text-red-800",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    textColor: "text-yellow-800",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    textColor: "text-blue-800",
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  duration = 3000,
  onClose,
}) => {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg
        ${config.bgColor} ${config.borderColor}
        animate-in slide-in-from-top-5 fade-in duration-300
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <p className={`text-sm font-medium ${config.textColor} pr-2`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`ml-auto flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors ${config.iconColor}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};
