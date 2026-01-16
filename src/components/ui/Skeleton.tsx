import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Title skeleton */}
          <Skeleton className="h-4 w-24 mb-3" />
          {/* Value skeleton */}
          <Skeleton className="h-8 w-16" />
        </div>
        {/* Icon skeleton */}
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({
  columns = 4,
}) => {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Add shimmer animation to global CSS
const shimmerStyle = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

// Inject shimmer animation if not already present
if (typeof document !== "undefined") {
  const styleId = "skeleton-shimmer-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = shimmerStyle;
    document.head.appendChild(style);
  }
}
