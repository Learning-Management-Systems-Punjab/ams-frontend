import api from "./api";

// ==================== Types ====================

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  collegeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateSubjectDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface SubjectListResponse {
  subjects: Subject[];
  currentPage: number;
  totalPages: number;
  totalSubjects: number;
  limit: number;
}

// ==================== Service ====================

const collegeAdminSubjectService = {
  /**
   * Create a new subject
   */
  create: async (data: CreateSubjectDto): Promise<Subject> => {
    const response = await api.post("/college-admin/subjects", data);
    return response.data.data;
  },

  /**
   * Get all subjects with pagination
   */
  getAll: async (
    page: number = 1,
    limit: number = 50,
  ): Promise<SubjectListResponse> => {
    const response = await api.get("/college-admin/subjects", {
      params: { page, limit },
    });

    // Map backend response to frontend expected format
    const data = response.data.data;
    return {
      subjects: data.subjects || [],
      currentPage: data.pagination?.page || page,
      totalPages: data.pagination?.pages || 1,
      totalSubjects: data.pagination?.total || 0,
      limit: data.pagination?.limit || limit,
    };
  },

  /**
   * Get single subject by ID
   */
  getById: async (subjectId: string): Promise<Subject> => {
    const response = await api.get(`/college-admin/subjects/${subjectId}`);
    return response.data.data;
  },

  /**
   * Update subject
   */
  update: async (
    subjectId: string,
    data: UpdateSubjectDto,
  ): Promise<Subject> => {
    const response = await api.put(
      `/college-admin/subjects/${subjectId}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Delete subject
   */
  delete: async (subjectId: string): Promise<void> => {
    await api.delete(`/college-admin/subjects/${subjectId}`);
  },

  /**
   * Search subjects by name or code
   */
  search: async (
    query: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<SubjectListResponse> => {
    const response = await api.get("/college-admin/subjects", {
      params: { page, limit, search: query },
    });
    return response.data.data;
  },
};

export default collegeAdminSubjectService;
