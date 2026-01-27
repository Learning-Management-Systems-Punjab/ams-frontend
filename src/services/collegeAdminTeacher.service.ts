import api from "./api";

// ==================== Type Definitions ====================

export interface Teacher {
  _id: string;
  name: string;
  fatherName: string;
  gender: "Male" | "Female" | "Other";
  cnic: string;
  dateOfBirth: string;
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
  religion: string;
  highestQualification: string;
  domicile: string;
  contactNumber: string;
  contactEmail: string;
  presentAddress: string;
  personalNumber: string;
  designation: string;
  bps: number;
  employmentStatus: "Regular" | "Contract";
  superannuation: string;
  joinedServiceAt: string;
  joinedCollegeAt: string;
  userId:
    | string
    | {
        _id: string;
        email: string;
        role: string;
      };
  collegeId:
    | string
    | {
        _id: string;
        name: string;
        code: string;
      };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherDto {
  name: string;
  fatherName: string;
  gender: "Male" | "Female" | "Other";
  cnic: string;
  dateOfBirth: string;
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
  religion: string;
  highestQualification: string;
  domicile: string;
  contactNumber: string;
  contactEmail: string;
  presentAddress: string;
  personalNumber: string;
  designation: string;
  bps: number;
  employmentStatus: "Regular" | "Contract";
  superannuation: string;
  joinedServiceAt: string;
  joinedCollegeAt: string;
  password?: string;
}

export interface UpdateTeacherDto {
  name?: string;
  fatherName?: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: string;
  maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
  religion?: string;
  highestQualification?: string;
  domicile?: string;
  contactNumber?: string;
  contactEmail?: string;
  presentAddress?: string;
  personalNumber?: string;
  designation?: string;
  bps?: number;
  employmentStatus?: "Regular" | "Contract";
  superannuation?: string;
  joinedServiceAt?: string;
  joinedCollegeAt?: string;
}

export interface TeacherCredentials {
  loginEmail: string;
  password: string;
}

export interface CreateTeacherResponse {
  teacher: Teacher;
  credentials: TeacherCredentials;
}

export interface BulkImportTeacher extends CreateTeacherDto {}

export interface BulkImportResult {
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: {
    successful: Array<{
      row: number;
      teacherId: string;
      name: string;
      loginEmail: string;
      password: string;
    }>;
    failed: Array<{
      row: number;
      data: Partial<BulkImportTeacher>;
      error: string;
    }>;
  };
}

export interface PaginatedTeachersResponse {
  teachers: Teacher[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ResetPasswordResponse {
  teacherId: string;
  name: string;
  loginEmail: string;
  newPassword: string;
}

// ==================== Service Functions ====================

export const collegeAdminTeacherService = {
  /**
   * Get all teachers with pagination
   */
  getAll: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Teacher[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get(
      `/college-admin/teachers?page=${page}&limit=${limit}`,
    );

    // Handle potential undefined data
    const responseData = response.data?.data || {};
    const teachers = responseData.teachers || [];
    const pagination = responseData.pagination || {};

    return {
      data: teachers,
      total: pagination.total || 0,
      page: pagination.page || page,
      limit: pagination.limit || limit,
      totalPages: pagination.pages || 1,
    };
  },

  /**
   * Search teachers by query
   */
  search: async (
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Teacher[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get(
      `/college-admin/teachers/search?q=${encodeURIComponent(
        query,
      )}&page=${page}&limit=${limit}`,
    );

    return {
      data: response.data.data.teachers || [],
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      limit: response.data.data.pagination.limit,
      totalPages: response.data.data.pagination.pages,
    };
  },

  /**
   * Get teacher by ID
   */
  getById: async (teacherId: string): Promise<Teacher> => {
    const response = await api.get(`/college-admin/teachers/${teacherId}`);
    return response.data.data;
  },

  /**
   * Create new teacher
   */
  create: async (data: CreateTeacherDto): Promise<CreateTeacherResponse> => {
    const response = await api.post("/college-admin/teachers", data);
    return response.data.data;
  },

  /**
   * Update teacher
   */
  update: async (
    teacherId: string,
    data: UpdateTeacherDto,
  ): Promise<Teacher> => {
    const response = await api.put(
      `/college-admin/teachers/${teacherId}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Delete teacher (soft delete)
   */
  delete: async (teacherId: string): Promise<void> => {
    await api.delete(`/college-admin/teachers/${teacherId}`);
  },

  /**
   * Reset teacher password
   */
  resetPassword: async (teacherId: string): Promise<ResetPasswordResponse> => {
    const response = await api.post(
      `/college-admin/teachers/${teacherId}/reset-password`,
    );
    return response.data.data;
  },

  /**
   * Bulk import teachers
   */
  bulkImport: async (
    teachers: BulkImportTeacher[],
  ): Promise<BulkImportResult> => {
    const response = await api.post("/college-admin/teachers/bulk-import", {
      teachers,
    });
    return response.data.data;
  },
};
