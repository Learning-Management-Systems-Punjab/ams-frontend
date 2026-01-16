import api from "./api";

// ==================== Types ====================

export interface TeacherAssignment {
  _id: string;
  teacherId: string;
  teacher?: {
    _id: string;
    name: string;
    email: string;
    contactNumber?: string;
  };
  subjectId: string;
  subject?: {
    _id: string;
    name: string;
    code: string;
  };
  sectionId: string;
  section?: {
    _id: string;
    name: string;
    year: string;
    shift: string;
  };
  academicYear: string;
  semester: string;
  collegeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherAssignmentDto {
  teacherId: string;
  subjectId: string;
  sectionId: string;
  academicYear: string;
  semester: "Fall" | "Spring" | "Summer";
}

export interface UpdateTeacherAssignmentDto {
  teacherId?: string;
  subjectId?: string;
  sectionId?: string;
  academicYear?: string;
  semester?: "Fall" | "Spring" | "Summer";
  isActive?: boolean;
}

export interface TeacherAssignmentListResponse {
  assignments: TeacherAssignment[];
  currentPage: number;
  totalPages: number;
  totalAssignments: number;
  limit: number;
}

export interface TeacherAssignmentFilters {
  academicYear?: string;
  semester?: string;
  programId?: string;
  page?: number;
  limit?: number;
}

export interface TeacherSchedule {
  teacher: {
    _id: string;
    name: string;
    email: string;
    contactNumber?: string;
  };
  assignments: Array<{
    _id: string;
    subject: {
      _id: string;
      name: string;
      code: string;
    };
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
    academicYear: string;
    semester: string;
  }>;
  totalAssignments: number;
}

export interface SectionTeachers {
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
  teachers: Array<{
    _id: string;
    teacher: {
      _id: string;
      name: string;
      email: string;
    };
    subject: {
      _id: string;
      name: string;
      code: string;
    };
    academicYear: string;
    semester: string;
  }>;
  totalTeachers: number;
}

// ==================== Service ====================

const collegeAdminTeacherAssignmentService = {
  /**
   * Create a new teacher assignment
   */
  create: async (
    data: CreateTeacherAssignmentDto
  ): Promise<TeacherAssignment> => {
    const response = await api.post("/college-admin/teacher-assignments", data);
    return response.data.data;
  },

  /**
   * Get all teacher assignments with pagination and filters
   */
  getAll: async (
    filters: TeacherAssignmentFilters = {}
  ): Promise<TeacherAssignmentListResponse> => {
    const { page = 1, limit = 50, ...rest } = filters;
    const response = await api.get("/college-admin/teacher-assignments", {
      params: { page, limit, ...rest },
    });
    return response.data.data;
  },

  /**
   * Get teacher's complete schedule
   */
  getTeacherSchedule: async (
    teacherId: string,
    filters: TeacherAssignmentFilters = {}
  ): Promise<TeacherSchedule> => {
    const { page = 1, limit = 100, ...rest } = filters;
    const response = await api.get(
      `/college-admin/teacher-assignments/teacher/${teacherId}`,
      {
        params: { page, limit, ...rest },
      }
    );
    return response.data.data;
  },

  /**
   * Get all teachers assigned to a section
   */
  getSectionTeachers: async (
    sectionId: string,
    filters: TeacherAssignmentFilters = {}
  ): Promise<SectionTeachers> => {
    const { page = 1, limit = 100, ...rest } = filters;
    const response = await api.get(
      `/college-admin/teacher-assignments/section/${sectionId}`,
      {
        params: { page, limit, ...rest },
      }
    );
    return response.data.data;
  },

  /**
   * Update teacher assignment
   */
  update: async (
    assignmentId: string,
    data: UpdateTeacherAssignmentDto
  ): Promise<TeacherAssignment> => {
    const response = await api.put(
      `/college-admin/teacher-assignments/${assignmentId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete teacher assignment
   */
  delete: async (assignmentId: string): Promise<void> => {
    await api.delete(`/college-admin/teacher-assignments/${assignmentId}`);
  },
};

export default collegeAdminTeacherAssignmentService;
