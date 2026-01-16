import api from "./api";

// ==================== Type Definitions ====================

export interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  fatherName: string;
  contactNumber?: string;
  cnic?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  collegeId:
    | string
    | {
        _id: string;
        name: string;
        code: string;
      };
  programId:
    | string
    | {
        _id: string;
        name: string;
        code: string;
      };
  sectionId:
    | string
    | {
        _id: string;
        name: string;
        year: string;
        shift: string;
      };
  userId?:
    | string
    | {
        _id: string;
        email: string;
        role: string;
      };
  enrollmentDate: string;
  status: "Active" | "Inactive" | "Graduated" | "Dropped";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  name: string;
  rollNumber: string;
  fatherName: string;
  contactNumber?: string;
  cnic?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  programId: string;
  sectionId: string;
  enrollmentDate?: string;
  status?: "Active" | "Inactive" | "Graduated" | "Dropped";
  createLoginAccount?: boolean;
}

export interface UpdateStudentDto {
  name?: string;
  rollNumber?: string;
  fatherName?: string;
  contactNumber?: string;
  cnic?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  address?: string;
  programId?: string;
  sectionId?: string;
  enrollmentDate?: string;
  status?: "Active" | "Inactive" | "Graduated" | "Dropped";
}

export interface StudentCredentials {
  loginEmail: string;
  password: string;
}

export interface CreateStudentResponse {
  student: Student;
  credentials?: StudentCredentials;
}

export interface BulkImportStudent extends CreateStudentDto {}

export interface BulkImportResult {
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: {
    successful: Array<{
      row: number;
      studentId: string;
      name: string;
      rollNumber: string;
      credentials?: StudentCredentials;
    }>;
    failed: Array<{
      row: number;
      data: Partial<BulkImportStudent>;
      error: string;
    }>;
  };
}

export interface PaginatedStudentsResponse {
  students: Student[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface StudentFilters {
  programId?: string;
  sectionId?: string;
  status?: "Active" | "Inactive" | "Graduated" | "Dropped";
}

export interface ExportStudent {
  rollNumber: string;
  name: string;
  fatherName: string;
  contactNumber?: string;
  cnic?: string;
  email?: string;
  loginEmail?: string;
  program: string;
  programCode: string;
  section: string;
  year: string;
  shift: string;
  status: string;
  enrollmentDate: string;
}

// ==================== Service Functions ====================

export const collegeAdminStudentService = {
  /**
   * Get all students with pagination and optional filters
   */
  getAll: async (
    page: number = 1,
    limit: number = 50,
    filters: StudentFilters = {}
  ): Promise<{
    data: Student[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.programId) params.append("programId", filters.programId);
    if (filters.sectionId) params.append("sectionId", filters.sectionId);
    if (filters.status) params.append("status", filters.status);

    const response = await api.get(
      `/college-admin/students?${params.toString()}`
    );

    return {
      data: response.data.data.students || [],
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      limit: response.data.data.pagination.limit,
      totalPages: response.data.data.pagination.pages,
    };
  },

  /**
   * Search students by query
   */
  search: async (
    query: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: Student[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get(
      `/college-admin/students/search?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );

    return {
      data: response.data.data.students || [],
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      limit: response.data.data.pagination.limit,
      totalPages: response.data.data.pagination.pages,
    };
  },

  /**
   * Get student by ID
   */
  getById: async (studentId: string): Promise<Student> => {
    const response = await api.get(`/college-admin/students/${studentId}`);
    return response.data.data;
  },

  /**
   * Create new student
   */
  create: async (data: CreateStudentDto): Promise<CreateStudentResponse> => {
    const response = await api.post("/college-admin/students", data);
    return response.data.data;
  },

  /**
   * Update student
   */
  update: async (
    studentId: string,
    data: UpdateStudentDto
  ): Promise<Student> => {
    const response = await api.put(
      `/college-admin/students/${studentId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete student (soft delete)
   */
  delete: async (studentId: string): Promise<void> => {
    await api.delete(`/college-admin/students/${studentId}`);
  },

  /**
   * Bulk import students
   */
  bulkImport: async (
    students: BulkImportStudent[],
    createLoginAccounts: boolean = false
  ): Promise<BulkImportResult> => {
    const response = await api.post("/college-admin/students/bulk-import", {
      students,
      createLoginAccounts,
    });
    return response.data.data;
  },

  /**
   * Export students to CSV format
   */
  export: async (filters: StudentFilters = {}): Promise<ExportStudent[]> => {
    const params = new URLSearchParams();

    if (filters.programId) params.append("programId", filters.programId);
    if (filters.sectionId) params.append("sectionId", filters.sectionId);

    const response = await api.get(
      `/college-admin/students/export?${params.toString()}`
    );
    return response.data.data;
  },
};
