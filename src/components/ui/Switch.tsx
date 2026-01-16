import React from "react";
import { Check } from "lucide-react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div className="flex items-start space-x-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${checked ? "bg-primary-600" : "bg-gray-200"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        >
          {checked && (
            <Check className="w-3 h-3 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
        </span>
      </button>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="block text-sm font-medium text-gray-700">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-xs text-gray-500">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};
