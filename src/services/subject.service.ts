import api from "./api";

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const subjectService = {
  // Get all subjects with pagination
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Subject>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/subjects?${params}`);
    return response.data.data;
  },

  // Get subject by ID
  getById: async (subjectId: string): Promise<Subject> => {
    const response = await api.get(`/subjects/${subjectId}`);
    return response.data.data;
  },

  // Search subjects
  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Subject>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/subjects/search?${params}`);
    return response.data.data;
  },
};
