import React from "react";
import { Calendar, BookOpen, CheckCircle, TrendingUp } from "lucide-react";

export const StudentDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Track your attendance and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Attendance"
          value="88%"
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Subjects"
          value="8"
          icon={<BookOpen className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Classes This Month"
          value="64"
          icon={<Calendar className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Improvement"
          value="+5%"
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Content Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Attendance Overview
        </h2>
        <p className="text-gray-500">
          Dashboard content will be implemented here...
        </p>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
      </div>
    </div>
  );
};
