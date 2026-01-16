import React, { useState, useEffect } from "react";
import {
  Users,
  Building2,
  MapPin,
  GraduationCap,
  UserCog,
  BookOpen,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import {
  statisticsService,
  type QuickStats,
  type DashboardStatistics,
} from "../../services/statistics.service";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/Toast";

export const SysAdminDashboard: React.FC = () => {
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, error } = useToast();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      // Fetch quick stats for the cards
      const stats = await statisticsService.getQuickStats();
      setQuickStats(stats);

      // Optionally fetch comprehensive stats
      const detailedStats = await statisticsService.getDashboardStats();
      setDashboardStats(detailedStats);
    } catch (err: any) {
      console.error("Error fetching statistics:", err);
      error(err.response?.data?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          System Administrator Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Manage the entire attendance system
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Regions"
          value={quickStats?.totalRegions ?? 0}
          icon={<MapPin className="w-6 h-6" />}
          color="bg-blue-500"
          isLoading={loading}
          subtitle="Active regions"
        />
        <StatCard
          title="Total Colleges"
          value={quickStats?.totalColleges ?? 0}
          icon={<Building2 className="w-6 h-6" />}
          color="bg-green-500"
          isLoading={loading}
          subtitle="Educational institutions"
        />
        <StatCard
          title="District Heads"
          value={quickStats?.totalDistrictHeads ?? 0}
          icon={<UserCog className="w-6 h-6" />}
          color="bg-purple-500"
          isLoading={loading}
          subtitle="Regional administrators"
        />
        <StatCard
          title="Total Students"
          value={quickStats?.totalStudents ?? 0}
          icon={<GraduationCap className="w-6 h-6" />}
          color="bg-orange-500"
          isLoading={loading}
          subtitle="Enrolled students"
        />
      </div>

      {/* Detailed Stats Grid */}
      {dashboardStats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Teachers"
            value={dashboardStats.overview.totalTeachers}
            icon={<Users className="w-6 h-6" />}
            color="bg-indigo-500"
            subtitle="Active teaching staff"
          />
          <StatCard
            title="Academic Programs"
            value={dashboardStats.overview.totalPrograms}
            icon={<BookOpen className="w-6 h-6" />}
            color="bg-pink-500"
            subtitle="Available programs"
          />
          <StatCard
            title="Total Sections"
            value={dashboardStats.overview.totalSections}
            icon={<TrendingUp className="w-6 h-6" />}
            color="bg-cyan-500"
            subtitle="Active sections"
          />
        </div>
      )}

      {/* Region Assignment Status */}
      {dashboardStats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              Region Assignment Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Regions with District Heads
                </span>
                <span className="text-lg font-bold text-green-600">
                  {dashboardStats.regions.withDistrictHeads}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Regions without District Heads
                </span>
                <span className="text-lg font-bold text-orange-600">
                  {dashboardStats.regions.withoutDistrictHeads}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Assignment Rate
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {dashboardStats.regions.assignmentRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${dashboardStats.regions.assignmentRate}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-orange-500" />
              Student Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Students</span>
                <span className="text-lg font-bold text-green-600">
                  {dashboardStats.students.active.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inactive Students</span>
                <span className="text-lg font-bold text-gray-600">
                  {dashboardStats.students.inactive.toLocaleString()}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Total Enrolled
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {dashboardStats.students.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions or Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
          System Overview
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading system information...</p>
        ) : dashboardStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">
                Active Colleges
              </p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {dashboardStats.colleges.active}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">
                Teaching Staff
              </p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {dashboardStats.personnel.totalTeachers.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">
                Academic Sections
              </p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {dashboardStats.academics.totalSections}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">
            Unable to load system information. Please try again.
          </p>
        )}
      </div>
    </div>
  );
};
