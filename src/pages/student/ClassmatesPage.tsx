import React, { useEffect, useState } from "react";
import {
  Users,
  Mail,
  Phone,
  User,
  Search,
  ArrowLeft,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import studentPortalService from "../../services/studentPortal.service";
import type { Classmate } from "../../services/studentPortal.service";
import { useToast } from "../../hooks/useToast";

export const ClassmatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClassmates();
  }, []);

  const fetchClassmates = async () => {
    try {
      setLoading(true);
      const data = await studentPortalService.getMyClassmates();
      setClassmates(data);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to load classmates",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredClassmates = classmates.filter(
    (classmate) =>
      classmate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classmate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classmate.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classmate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/student/dashboard")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classmates</h1>
          <p className="text-gray-600 mt-1">View students in your section</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-lg">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-blue-100 text-sm">Total Classmates</p>
            <p className="text-3xl font-bold">{classmates.length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Classmates Grid */}
      {filteredClassmates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassmates.map((classmate) => (
            <ClassmateCard key={classmate._id} classmate={classmate} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            {searchTerm ? (
              <>
                <Search className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium">
                  No classmates found
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Try searching with different keywords
                </p>
              </>
            ) : (
              <>
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium">
                  No classmates available
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">About Classmates</p>
            <p>
              This list shows all students enrolled in your section. You can
              search by name, roll number, or email to find specific classmates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ClassmateCardProps {
  classmate: Classmate;
}

const ClassmateCard: React.FC<ClassmateCardProps> = ({ classmate }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Avatar & Name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {classmate.firstName} {classmate.lastName}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <GraduationCap className="w-4 h-4" />
            Roll No: {classmate.rollNumber}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${studentPortalService.getStatusColor(
            classmate.status
          )}`}
        >
          {classmate.status.charAt(0).toUpperCase() + classmate.status.slice(1)}
        </span>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <a
            href={`mailto:${classmate.email}`}
            className="text-blue-600 hover:text-blue-700 truncate"
          >
            {classmate.email}
          </a>
        </div>
        {classmate.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a
              href={`tel:${classmate.phone}`}
              className="text-gray-600 hover:text-gray-900 truncate"
            >
              {classmate.phone}
            </a>
          </div>
        )}
        {!classmate.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>Phone not available</span>
          </div>
        )}
      </div>
    </div>
  );
};
