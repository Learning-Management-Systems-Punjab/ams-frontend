import React from "react";
import { StatCardSkeleton } from "./Skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
  isLoading = false,
}) => {
  if (isLoading) {
    return <StatCardSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900 animate-in fade-in duration-500">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`${color} p-3 rounded-lg text-white shadow-lg transform hover:scale-110 transition-transform duration-200`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};
