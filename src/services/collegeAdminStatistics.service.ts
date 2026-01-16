import api from "./api";

// ==================== Type Definitions ====================

export interface CollegeAdminQuickStats {
  totalTeachers: number;
  totalStudents: number;
  totalPrograms: number;
  totalSections: number;
  totalSubjects: number;
}

export interface CollegeAdminDashboardStats {
  college: {
    id: string;
    name: string;
    code: string;
    city: string;
    establishedYear?: number;
  };
  statistics: {
    overview: {
      totalTeachers: number;
      totalStudents: number;
      totalPrograms: number;
      totalSections: number;
      totalSubjects: number;
    };
    students: {
      total: number;
      active: number;
      inactive: number;
      activePercentage: number;
      byGender: {
        male: number;
        female: number;
      };
      byStatus: {
        active: number;
        inactive: number;
        graduated: number;
        dropped: number;
      };
    };
    teachers: {
      total: number;
      byGender: {
        male: number;
        female: number;
      };
    };
    academics: {
      averageStudentsPerSection: number;
      averageTeachersPerProgram: number;
    };
  };
}

export interface ProgramStatistics {
  programId: string;
  programName: string;
  totalStudents: number;
  totalSections: number;
  activeStudents: number;
  inactiveStudents: number;
}

export interface SectionStatistics {
  sectionId: string;
  sectionName: string;
  programName: string;
  totalStudents: number;
  activeStudents: number;
  capacity?: number;
  occupancyRate?: number;
}

export interface TeacherStatistics {
  total: number;
  byGender: {
    male: number;
    female: number;
  };
  byQualification: Array<{
    qualification: string;
    count: number;
  }>;
  byEmploymentStatus: {
    regular: number;
    contract: number;
  };
  subjectAssignments: {
    totalAssignments: number;
    averagePerTeacher: number;
    teachersWithAssignments: number;
    teachersWithoutAssignments: number;
  };
}

export interface RecentEnrollment {
  _id: string;
  studentName: string;
  rollNumber: string;
  programName: string;
  sectionName: string;
  enrollmentDate: string;
  status: string;
}

export interface CapacityStatistics {
  overall: {
    totalCapacity: number;
    totalEnrolled: number;
    availableSeats: number;
    utilizationPercentage: number;
  };
  sections: Array<{
    sectionId: string;
    sectionName: string;
    programName: string;
    capacity: number;
    enrolled: number;
    available: number;
    utilizationPercentage: number;
  }>;
}

// ==================== Service Functions ====================

export const collegeAdminStatisticsService = {
  /**
   * Get quick stats for dashboard cards (Ultra-fast)
   * Returns: totalTeachers, totalStudents, totalPrograms, totalSections, totalSubjects
   */
  getQuickStats: async (): Promise<CollegeAdminQuickStats> => {
    const response = await api.get("/college-admin/statistics/quick");
    return response.data.data;
  },

  /**
   * Get comprehensive dashboard statistics (Fast)
   * Returns: Complete college overview, student breakdown, teacher stats, academic metrics
   */
  getDashboardStats: async (): Promise<CollegeAdminDashboardStats> => {
    const response = await api.get("/college-admin/statistics/dashboard");
    return response.data.data;
  },

  /**
   * Get program-wise statistics (Fast)
   * Returns: Student count, sections, active/inactive students per program
   */
  getProgramStats: async (): Promise<ProgramStatistics[]> => {
    const response = await api.get("/college-admin/statistics/programs");
    return response.data.data.programs;
  },

  /**
   * Get section-wise statistics (Fast)
   * Returns: Student count, capacity, occupancy rate per section
   */
  getSectionStats: async (): Promise<SectionStatistics[]> => {
    const response = await api.get("/college-admin/statistics/sections");
    return response.data.data.sections;
  },

  /**
   * Get teacher analytics (Medium)
   * Returns: Gender breakdown, qualifications, employment status, subject assignments
   */
  getTeacherStats: async (): Promise<TeacherStatistics> => {
    const response = await api.get("/college-admin/statistics/teachers");
    return response.data.data;
  },

  /**
   * Get recent student enrollments (Fast)
   * @param limit - Number of recent enrollments to fetch (default: 10)
   * Returns: Latest student enrollments with program and section details
   */
  getRecentEnrollments: async (
    limit: number = 10
  ): Promise<RecentEnrollment[]> => {
    const response = await api.get(
      `/college-admin/statistics/recent-enrollments?limit=${limit}`
    );
    return response.data.data.enrollments;
  },

  /**
   * Get capacity utilization statistics (Medium)
   * Returns: Overall capacity metrics and per-section breakdown
   */
  getCapacityStats: async (): Promise<CapacityStatistics> => {
    const response = await api.get("/college-admin/statistics/capacity");
    return response.data.data;
  },
};
