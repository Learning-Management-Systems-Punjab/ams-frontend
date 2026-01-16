import api from "./api";

// ==================== Types ====================

export interface RollNumberRange {
  start: number;
  end: number;
}

export interface Section {
  _id: string;
  name: string;
  programId: string;
  program?: {
    _id: string;
    name: string;
    code: string;
  };
  year: string;
  shift: string;
  rollNumberRange: RollNumberRange;
  subjects: string[];
  capacity: number;
  currentStrength: number;
  collegeId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionDto {
  name: string;
  programId: string;
  year: string;
  shift: string;
  rollNumberRange: RollNumberRange;
  subjects: string[];
  capacity: number;
}

export interface UpdateSectionDto {
  name?: string;
  year?: string;
  shift?: string;
  rollNumberRange?: RollNumberRange;
  subjects?: string[];
  capacity?: number;
  isActive?: boolean;
}

export interface SectionRange {
  name: string;
  start: number;
  end: number;
  shift: string;
  subjects: string[];
  capacity: number;
}

export interface SplitSectionsDto {
  programId: string;
  year: string;
  sectionRanges: SectionRange[];
}

export interface SplitSectionsResult {
  createdSections: Section[];
  assignedStudents: {
    sectionId: string;
    sectionName: string;
    studentCount: number;
    students: Array<{
      _id: string;
      name: string;
      rollNumber: string;
    }>;
  }[];
  summary: {
    totalSections: number;
    totalStudentsAssigned: number;
  };
}

export interface AssignStudentDto {
  studentId: string;
  sectionId: string;
}

export interface BulkAssignDto {
  assignments: AssignStudentDto[];
}

export interface SectionListResponse {
  sections: Section[];
  currentPage: number;
  totalPages: number;
  totalSections: number;
  limit: number;
}

export interface SectionFilters {
  programId?: string;
  year?: string;
  shift?: string;
  page?: number;
  limit?: number;
}

// ==================== Service ====================

const collegeAdminSectionManagementService = {
  /**
   * Create a new section
   */
  create: async (data: CreateSectionDto): Promise<Section> => {
    const response = await api.post("/college-admin/sections", data);
    return response.data.data;
  },

  /**
   * Get all sections with pagination and filters
   */
  getAll: async (
    filters: SectionFilters = {}
  ): Promise<SectionListResponse> => {
    const { page = 1, limit = 50, ...rest } = filters;
    const response = await api.get("/college-admin/sections", {
      params: { page, limit, ...rest },
    });
    return response.data.data;
  },

  /**
   * Get single section by ID
   */
  getById: async (sectionId: string): Promise<Section> => {
    const response = await api.get(`/college-admin/sections/${sectionId}`);
    return response.data.data;
  },

  /**
   * Update section
   */
  update: async (
    sectionId: string,
    data: UpdateSectionDto
  ): Promise<Section> => {
    const response = await api.put(
      `/college-admin/sections/${sectionId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete section
   */
  delete: async (sectionId: string): Promise<void> => {
    await api.delete(`/college-admin/sections/${sectionId}`);
  },

  /**
   * Split sections by roll number ranges (Key Feature ⭐)
   * Creates multiple sections and automatically assigns students
   */
  splitByRollRanges: async (
    data: SplitSectionsDto
  ): Promise<SplitSectionsResult> => {
    const response = await api.post(
      "/college-admin/sections/split-by-roll-ranges",
      data
    );
    return response.data.data;
  },

  /**
   * Assign a single student to a section
   */
  assignStudent: async (data: AssignStudentDto): Promise<void> => {
    await api.post("/college-admin/sections/assign-student", data);
  },

  /**
   * Bulk assign students to sections
   */
  bulkAssign: async (data: BulkAssignDto): Promise<void> => {
    await api.post("/college-admin/sections/bulk-assign", data);
  },
};

export default collegeAdminSectionManagementService;
