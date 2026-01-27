import api from "./api";

// ==================== Types ====================

export interface TeacherAssignment {
  _id: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
  };
  section: {
    _id: string;
    name: string;
    year: string;
    shift: string;
    program: {
      _id: string;
      name: string;
      code: string;
    };
  };
  subject: {
    _id: string;
    name: string;
    code: string;
    creditHours: number;
  };
  academicYear: string;
  semester: "Fall" | "Spring" | "Summer";
  schedule?: {
    day: string;
    period: string;
    startTime: string;
    endTime: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone?: string;
  section: {
    _id: string;
    name: string;
  };
  program: {
    _id: string;
    name: string;
    code: string;
  };
  year: string;
  shift: string;
}

export interface AttendanceRecord {
  _id: string;
  student: {
    _id: string;
    name: string;
    rollNumber: string;
  };
  section: {
    _id: string;
    name: string;
  };
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  teacher: {
    _id: string;
    name: string;
  };
  date: string;
  period: string;
  status: "Present" | "Absent" | "Late" | "Leave" | "Excused";
  remarks?: string;
  markedAt: string;
}

// Grouped attendance record for attendance records list
export interface GroupedAttendanceRecord {
  _id: string;
  section: {
    _id: string;
    name: string;
    year?: string;
    shift?: string;
  } | null;
  subject: {
    _id: string;
    name: string;
    code: string;
  } | null;
  date: string;
  period: number;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  attendancePercentage: number;
  markedAt: string;
}

export interface AttendanceSheetStudent {
  _id: string;
  name: string;
  rollNumber: string;
  section: string;
}

export interface StudentAttendanceStats {
  student: {
    _id: string;
    name: string;
    rollNumber: string;
    section: string;
    program: string;
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
  stats: {
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    excused: number;
    attendancePercentage: number;
  };
}

export interface SectionAttendanceStats {
  section: {
    _id: string;
    name: string;
    year: string;
    shift: string;
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
  studentStats: {
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
  }[];
}

export interface MarkAttendanceDto {
  sectionId: string;
  subjectId: string;
  date: string;
  period: string;
  attendanceRecords: {
    studentId: string;
    status: "Present" | "Absent" | "Late" | "Leave" | "Excused";
    remarks?: string;
  }[];
}

// ==================== API Service ====================

class TeacherPortalService {
  private basePath = "/teacher-portal";

  // Get teacher's assignments
  async getMyAssignments(filters?: {
    academicYear?: string;
    semester?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<{
      data: {
        assignments: TeacherAssignment[];
        pagination: {
          currentPage: number;
          perPage: number;
          totalPages: number;
          totalItems: number;
        };
      };
    }>(`${this.basePath}/my-assignments`, { params: filters });

    // Transform response to expected format
    const { assignments, pagination } = response.data.data;
    return {
      assignments,
      total: pagination.totalItems,
      page: pagination.currentPage,
      limit: pagination.perPage,
      totalPages: pagination.totalPages,
    };
  }

  // Get unique sections assigned to teacher
  async getMySections(filters?: { academicYear?: string; semester?: string }) {
    const response = await api.get<{
      data: {
        sections: {
          _id: string;
          name: string;
          year: string;
          shift: string;
          program: { _id: string; name: string; code: string };
        }[];
      };
    }>(`${this.basePath}/my-sections`, { params: filters });
    return response.data.data;
  }

  // Get unique subjects assigned to teacher
  async getMySubjects(filters?: { academicYear?: string; semester?: string }) {
    const response = await api.get<{
      data: {
        subjects: {
          _id: string;
          name: string;
          code: string;
          creditHours: number;
        }[];
      };
    }>(`${this.basePath}/my-subjects`, { params: filters });
    return response.data.data;
  }

  // Get students in a section (validates assignment)
  async getSectionStudents(
    sectionId: string,
    filters?: { page?: number; limit?: number; search?: string },
  ) {
    const response = await api.get<{
      data: Student[];
    }>(`${this.basePath}/sections/${sectionId}/students`, { params: filters });
    return { students: response.data.data };
  }

  // Mark attendance (validates assignment)
  async markAttendance(data: MarkAttendanceDto) {
    const response = await api.post<{
      data: {
        message: string;
        marked: number;
        attendance: AttendanceRecord[];
      };
    }>(`${this.basePath}/attendance/mark`, data);
    return response.data.data;
  }

  // Get grouped attendance records (grouped by section/subject/date/period)
  async getAttendance(filters: {
    sectionId?: string;
    subjectId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    studentId?: string;
    period?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    attendance: GroupedAttendanceRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await api.get<{
      data: {
        attendance: GroupedAttendanceRecord[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`${this.basePath}/attendance`, { params: filters });

    return {
      attendance: response.data.data.attendance || [],
      total: response.data.data.total || 0,
      page: response.data.data.page || 1,
      limit: response.data.data.limit || 50,
      totalPages: response.data.data.totalPages || 1,
    };
  }

  // Generate attendance sheet (pre-filled student list)
  async generateAttendanceSheet(
    sectionId: string,
    subjectId: string,
    date: string,
  ) {
    const response = await api.get<{
      data: {
        section: {
          _id: string;
          name: string;
          year: string;
          shift: string;
        };
        subject: {
          _id: string;
          name: string;
          code: string;
        };
        date: string;
        students: AttendanceSheetStudent[];
        alreadyMarked: boolean;
      };
    }>(`${this.basePath}/attendance/sheet`, {
      params: { sectionId, subjectId, date },
    });
    return response.data.data;
  }

  // Get student attendance statistics
  async getStudentStats(
    studentId: string,
    filters: {
      subjectId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const response = await api.get<{
      data: StudentAttendanceStats;
    }>(`${this.basePath}/attendance/stats/student/${studentId}`, {
      params: filters,
    });
    return response.data.data;
  }

  // Get section attendance statistics
  async getSectionStats(
    sectionId: string,
    subjectId: string,
    startDate: string,
    endDate: string,
  ) {
    const response = await api.get<SectionAttendanceStats>(
      `${this.basePath}/attendance/stats/section/${sectionId}`,
      {
        params: { subjectId, startDate, endDate },
      },
    );
    return response.data;
  }
}

export default new TeacherPortalService();
