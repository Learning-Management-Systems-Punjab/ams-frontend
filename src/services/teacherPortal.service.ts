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
      assignments: TeacherAssignment[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${this.basePath}/my-assignments`, { params: filters });
    return response.data;
  }

  // Get unique sections assigned to teacher
  async getMySections(filters?: { academicYear?: string; semester?: string }) {
    const response = await api.get<{
      sections: {
        _id: string;
        name: string;
        year: string;
        shift: string;
        program: { _id: string; name: string; code: string };
      }[];
    }>(`${this.basePath}/my-sections`, { params: filters });
    return response.data;
  }

  // Get unique subjects assigned to teacher
  async getMySubjects(filters?: { academicYear?: string; semester?: string }) {
    const response = await api.get<{
      subjects: {
        _id: string;
        name: string;
        code: string;
        creditHours: number;
      }[];
    }>(`${this.basePath}/my-subjects`, { params: filters });
    return response.data;
  }

  // Get students in a section (validates assignment)
  async getSectionStudents(
    sectionId: string,
    filters?: { page?: number; limit?: number; search?: string }
  ) {
    const response = await api.get<{
      students: Student[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${this.basePath}/sections/${sectionId}/students`, { params: filters });
    return response.data;
  }

  // Mark attendance (validates assignment)
  async markAttendance(data: MarkAttendanceDto) {
    const response = await api.post<{
      message: string;
      marked: number;
      attendance: AttendanceRecord[];
    }>(`${this.basePath}/attendance/mark`, data);
    return response.data;
  }

  // Get attendance records
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
  }) {
    const response = await api.get<{
      attendance: AttendanceRecord[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${this.basePath}/attendance`, { params: filters });
    return response.data;
  }

  // Generate attendance sheet (pre-filled student list)
  async generateAttendanceSheet(
    sectionId: string,
    subjectId: string,
    date: string
  ) {
    const response = await api.get<{
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
    }>(`${this.basePath}/attendance/sheet`, {
      params: { sectionId, subjectId, date },
    });
    return response.data;
  }

  // Get student attendance statistics
  async getStudentStats(
    studentId: string,
    filters: {
      subjectId?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const response = await api.get<StudentAttendanceStats>(
      `${this.basePath}/attendance/stats/student/${studentId}`,
      { params: filters }
    );
    return response.data;
  }

  // Get section attendance statistics
  async getSectionStats(
    sectionId: string,
    subjectId: string,
    startDate: string,
    endDate: string
  ) {
    const response = await api.get<SectionAttendanceStats>(
      `${this.basePath}/attendance/stats/section/${sectionId}`,
      {
        params: { subjectId, startDate, endDate },
      }
    );
    return response.data;
  }
}

export default new TeacherPortalService();
