import api from "./api";

// ==================== Types ====================

export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Late"
  | "Leave"
  | "Excused";

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface Attendance {
  _id: string;
  studentId: string;
  student?: {
    _id: string;
    name: string;
    rollNumber: string;
  };
  sectionId: string;
  section?: {
    _id: string;
    name: string;
    year: string;
  };
  subjectId: string;
  subject?: {
    _id: string;
    name: string;
    code: string;
  };
  date: string;
  period: number;
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
  collegeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarkAttendanceDto {
  sectionId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  period: number;
  attendanceRecords: AttendanceRecord[];
}

export interface MarkAttendanceResult {
  message: string;
  date: string;
  sectionId: string;
  subjectId: string;
  period: number;
  totalRecords: number;
  successfulRecords: number;
  records: Attendance[];
}

export interface UpdateAttendanceDto {
  status?: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceListResponse {
  attendance: Attendance[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

export interface AttendanceFilters {
  sectionId?: string;
  subjectId?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface StudentAttendanceFilters {
  subjectId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface StudentAttendanceStats {
  student: {
    _id: string;
    name: string;
    rollNumber: string;
    program?: string;
    section?: string;
  };
  stats: {
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    excused: number;
    attendancePercentage: number;
  };
  subjectWiseStats?: Array<{
    subject: {
      _id: string;
      name: string;
      code: string;
    };
    totalClasses: number;
    present: number;
    absent: number;
    attendancePercentage: number;
  }>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface SectionAttendanceStats {
  section: {
    _id: string;
    name: string;
    year: string;
    shift: string;
    program?: {
      name: string;
      code: string;
    };
  };
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  overallStats: {
    totalStudents: number;
    totalClasses: number;
    averageAttendance: number;
  };
  studentStats: Array<{
    student: {
      _id: string;
      name: string;
      rollNumber: string;
    };
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    excused: number;
    attendancePercentage: number;
  }>;
  currentPage: number;
  totalPages: number;
  totalStudents: number;
}

export interface AttendanceSheet {
  section: {
    _id: string;
    name: string;
    year: string;
    shift: string;
    program?: {
      name: string;
      code: string;
    };
  };
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  students: Array<{
    _id: string;
    name: string;
    rollNumber: string;
    fatherName?: string;
  }>;
  totalStudents: number;
  generatedAt: string;
}

// ==================== Service ====================

const collegeAdminAttendanceService = {
  /**
   * Mark attendance for multiple students (Bulk marking) ⭐
   */
  markAttendance: async (
    data: MarkAttendanceDto
  ): Promise<MarkAttendanceResult> => {
    const response = await api.post("/college-admin/attendance/mark", data);
    return response.data.data;
  },

  /**
   * Get attendance records with filters
   */
  getAttendance: async (
    filters: AttendanceFilters
  ): Promise<AttendanceListResponse> => {
    const { page = 1, limit = 200, ...rest } = filters;
    const response = await api.get("/college-admin/attendance", {
      params: { page, limit, ...rest },
    });
    return response.data.data;
  },

  /**
   * Get student attendance history
   */
  getStudentAttendance: async (
    studentId: string,
    filters: StudentAttendanceFilters = {}
  ): Promise<AttendanceListResponse> => {
    const { page = 1, limit = 100, ...rest } = filters;
    const response = await api.get(
      `/college-admin/attendance/student/${studentId}`,
      {
        params: { page, limit, ...rest },
      }
    );
    return response.data.data;
  },

  /**
   * Get student attendance statistics ⭐
   */
  getStudentStats: async (
    studentId: string,
    filters: StudentAttendanceFilters = {}
  ): Promise<StudentAttendanceStats> => {
    const response = await api.get(
      `/college-admin/attendance/stats/student/${studentId}`,
      {
        params: filters,
      }
    );
    return response.data.data;
  },

  /**
   * Get section attendance statistics ⭐
   */
  getSectionStats: async (
    sectionId: string,
    subjectId: string,
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 100
  ): Promise<SectionAttendanceStats> => {
    const response = await api.get(
      `/college-admin/attendance/stats/section/${sectionId}`,
      {
        params: { subjectId, startDate, endDate, page, limit },
      }
    );
    return response.data.data;
  },

  /**
   * Generate attendance sheet for a section ⭐
   * Get pre-formatted list of students ready for marking
   */
  generateSheet: async (
    sectionId: string,
    subjectId: string
  ): Promise<AttendanceSheet> => {
    const response = await api.get(
      `/college-admin/attendance/sheet/${sectionId}`,
      {
        params: { subjectId },
      }
    );
    return response.data.data;
  },

  /**
   * Update single attendance record
   */
  update: async (
    attendanceId: string,
    data: UpdateAttendanceDto
  ): Promise<Attendance> => {
    const response = await api.put(
      `/college-admin/attendance/${attendanceId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete attendance record
   */
  delete: async (attendanceId: string): Promise<void> => {
    await api.delete(`/college-admin/attendance/${attendanceId}`);
  },
};

export default collegeAdminAttendanceService;
