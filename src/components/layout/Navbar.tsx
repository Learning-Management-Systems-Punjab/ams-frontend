import React from "react";
import { Bell, Search, ChevronDown } from "lucide-react";
import { useAppSelector } from "../../store/hooks";

export const Navbar: React.FC = () => {
  const { user, profile } = useAppSelector((state) => state.auth);

  const getProfileName = () => {
    if (!profile) return "User";
    return (profile as any).name || "User";
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 ml-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {getProfileName()}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <button className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {getProfileName().charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
