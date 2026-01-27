import api from "./api";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface StudentProfile {
  _id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  admissionDate?: string;
  status: "active" | "inactive" | "graduated" | "expelled";
  section: {
    _id: string;
    name: string;
    academicYear: string;
    semester: string;
    capacity: number;
    program: {
      _id: string;
      name: string;
      code: string;
      duration: number;
      level: string;
    };
    college: {
      _id: string;
      name: string;
      code: string;
      city: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface SectionDetails {
  _id: string;
  name: string;
  academicYear: string;
  semester: string;
  capacity: number;
  enrolledStudents: number;
  program: {
    _id: string;
    name: string;
    code: string;
    duration: number;
    level: string;
  };
  college: {
    _id: string;
    name: string;
    code: string;
    city: string;
  };
  subjects: Array<{
    _id: string;
    name: string;
    code: string;
    creditHours: number;
    type: string;
    teachers: Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      specialization?: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  date: string;
  period: number;
  status: "Present" | "Absent" | "Late" | "Leave" | "Excused";
  remarks?: string;
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  section: {
    _id: string;
    name: string;
  };
  markedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface AttendanceStats {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  excused: number;
  attendancePercentage: number;
  statusBreakdown: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export interface AttendanceSummary {
  message?: string;
  totalSubjects?: number;
  overall?: {
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
  };
  subjects: Array<{
    subject: {
      _id: string;
      name: string;
      code: string;
    };
    teachers: Array<{
      _id: string;
      firstName: string;
      lastName: string;
    }>;
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendancePercentage: number;
  }>;
  section?: {
    _id: string;
    name: string;
  };
}

export interface Classmate {
  _id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AttendanceFilters {
  subject?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Service Class
// ============================================================================

class StudentPortalService {
  private basePath = "/student-portal";

  /**
   * Get current student's profile with section and program details
   */
  async getMyProfile(): Promise<StudentProfile> {
    const response = await api.get<ApiResponse<StudentProfile>>(
      `${this.basePath}/my-profile`,
    );
    return response.data.data;
  }

  /**
   * Get section details including subjects and teachers
   */
  async getMySectionDetails(): Promise<SectionDetails> {
    const response = await api.get<ApiResponse<SectionDetails>>(
      `${this.basePath}/my-section`,
    );
    return response.data.data;
  }

  /**
   * Get attendance records with optional filters and pagination
   */
  async getMyAttendance(
    filters: AttendanceFilters = {},
  ): Promise<PaginatedResponse<AttendanceRecord>> {
    const params = new URLSearchParams();

    if (filters.subject) params.append("subjectId", filters.subject);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await api.get<
      ApiResponse<PaginatedResponse<AttendanceRecord>>
    >(`${this.basePath}/my-attendance?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Get attendance statistics with optional subject filter
   */
  async getMyAttendanceStats(subject?: string): Promise<AttendanceStats> {
    const params = subject ? `?subjectId=${subject}` : "";
    const response = await api.get<ApiResponse<AttendanceStats>>(
      `${this.basePath}/my-attendance/stats${params}`,
    );
    return response.data.data;
  }

  /**
   * Get comprehensive attendance summary (overall + subject-wise)
   */
  async getMyAttendanceSummary(): Promise<AttendanceSummary> {
    const response = await api.get<ApiResponse<AttendanceSummary>>(
      `${this.basePath}/my-attendance/summary`,
    );
    return response.data.data;
  }

  /**
   * Get classmates in the same section
   */
  async getMyClassmates(): Promise<Classmate[]> {
    const response = await api.get<ApiResponse<Classmate[]>>(
      `${this.basePath}/my-classmates`,
    );
    return response.data.data;
  }

  /**
   * Helper: Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Helper: Format date and time for display
   */
  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Helper: Get status color class
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      Present: "text-green-600 bg-green-50 border-green-200",
      Absent: "text-red-600 bg-red-50 border-red-200",
      Late: "text-yellow-600 bg-yellow-50 border-yellow-200",
      Leave: "text-blue-600 bg-blue-50 border-blue-200",
      Excused: "text-purple-600 bg-purple-50 border-purple-200",
      active: "text-green-600 bg-green-50 border-green-200",
      inactive: "text-gray-600 bg-gray-50 border-gray-200",
      graduated: "text-blue-600 bg-blue-50 border-blue-200",
      expelled: "text-red-600 bg-red-50 border-red-200",
    };
    return colors[status] || "text-gray-600 bg-gray-50 border-gray-200";
  }

  /**
   * Helper: Get attendance percentage color
   */
  getPercentageColor(percentage: number): string {
    if (percentage >= 85) return "text-green-600";
    if (percentage >= 75) return "text-orange-600";
    return "text-red-600";
  }

  /**
   * Helper: Get attendance status badge
   */
  getStatusBadge(percentage: number): { text: string; color: string } {
    if (percentage >= 85) {
      return {
        text: "Excellent",
        color: "bg-green-100 text-green-800 border-green-200",
      };
    }
    if (percentage >= 75) {
      return {
        text: "Good",
        color: "bg-orange-100 text-orange-800 border-orange-200",
      };
    }
    return { text: "Low", color: "bg-red-100 text-red-800 border-red-200" };
  }
}

export default new StudentPortalService();
