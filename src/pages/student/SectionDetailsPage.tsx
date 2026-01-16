import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  Mail,
  Phone,
  Award,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import studentPortalService from "../../services/studentPortal.service";
import type { SectionDetails } from "../../services/studentPortal.service";
import { useToast } from "../../hooks/useToast";

export const SectionDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<SectionDetails | null>(null);

  useEffect(() => {
    fetchSectionDetails();
  }, []);

  const fetchSectionDetails = async () => {
    try {
      setLoading(true);
      const data = await studentPortalService.getMySectionDetails();
      setSection(data);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to load section details",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load section details</p>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Section Details</h1>
          <p className="text-gray-600 mt-1">
            View your section and subjects information
          </p>
        </div>
      </div>

      {/* Section Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Section Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoCard
            icon={<Users className="w-5 h-5 text-blue-600" />}
            label="Section"
            value={section.name}
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-green-600" />}
            label="Academic Year"
            value={section.academicYear}
          />
          <InfoCard
            icon={<GraduationCap className="w-5 h-5 text-purple-600" />}
            label="Semester"
            value={section.semester}
          />
          <InfoCard
            icon={<Users className="w-5 h-5 text-orange-600" />}
            label="Students"
            value={`${section.enrolledStudents} / ${section.capacity}`}
          />
        </div>
      </div>

      {/* Program Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Program Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Program Name</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {section.program.name}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Program Code</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {section.program.code}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {section.program.duration} Years ({section.program.level})
            </p>
          </div>
        </div>
      </div>

      {/* College Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          College Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">College Name</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {section.college.name}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">College Code</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {section.college.code}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">City</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {section.college.city}
            </p>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Subjects ({section.subjects.length})
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {section.subjects.map((subject) => (
            <div
              key={subject._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-600">{subject.code}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-600">
                    Credit Hours
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {subject.creditHours}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    subject.type === "Theory"
                      ? "bg-blue-100 text-blue-700"
                      : subject.type === "Lab"
                      ? "bg-green-100 text-green-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {subject.type}
                </span>
              </div>

              {/* Teachers */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Teachers ({subject.teachers.length})
                </p>
                <div className="space-y-2">
                  {subject.teachers.map((teacher) => (
                    <div
                      key={teacher._id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <p className="font-semibold text-gray-900">
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      {teacher.specialization && (
                        <p className="text-xs text-gray-600 mt-1">
                          <Award className="w-3 h-3 inline mr-1" />
                          {teacher.specialization}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                        {teacher.email && (
                          <a
                            href={`mailto:${teacher.email}`}
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            <Mail className="w-3 h-3" />
                            {teacher.email}
                          </a>
                        )}
                        {teacher.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {teacher.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-gray-100 p-3 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
};
