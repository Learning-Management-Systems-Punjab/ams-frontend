import api from "./api";

export interface Teacher {
  _id: string;
  userId: string;
  name: string;
  email: string;
  cnic: string;
  phoneNumber?: string;
  address?: string;
  collegeId: string;
  qualification?: string;
  experience?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    email: string;
    role: string;
  };
  college?: {
    _id: string;
    name: string;
    code: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const teacherService = {
  // Get all teachers with pagination
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Teacher>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/teachers?${params}`);
    return response.data.data;
  },

  // Get teacher by ID
  getById: async (teacherId: string): Promise<Teacher> => {
    const response = await api.get(`/teachers/${teacherId}`);
    return response.data.data;
  },

  // Search teachers
  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Teacher>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/teachers/search?${params}`);
    return response.data.data;
  },
};
