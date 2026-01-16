import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`
          w-full px-4 py-2.5 rounded-lg border transition-all duration-200
          ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          }
          focus:outline-none focus:ring-2 focus:ring-opacity-20
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
          placeholder:text-gray-400
          ${className}
        `}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
