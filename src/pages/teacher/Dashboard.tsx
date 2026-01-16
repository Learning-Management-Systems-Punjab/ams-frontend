import React from "react";
import { Users, BookOpen, Calendar, CheckCircle } from "lucide-react";

export const TeacherDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your classes and attendance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Students"
          value="156"
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="My Subjects"
          value="3"
          icon={<BookOpen className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Classes Today"
          value="4"
          icon={<Calendar className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Attendance Rate"
          value="92%"
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Content Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Schedule
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
