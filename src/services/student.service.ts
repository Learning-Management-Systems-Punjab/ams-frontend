import api from "./api";

export interface Student {
  _id: string;
  userId: string;
  name: string;
  email: string;
  cnic: string;
  rollNumber: string;
  phoneNumber?: string;
  address?: string;
  sectionId: string;
  programId: string;
  fatherName?: string;
  dateOfBirth?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    email: string;
    role: string;
  };
  section?: {
    _id: string;
    name: string;
  };
  program?: {
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

export const studentService = {
  // Get all students with pagination
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Student>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/students?${params}`);
    return response.data.data;
  },

  // Get student by ID
  getById: async (studentId: string): Promise<Student> => {
    const response = await api.get(`/students/${studentId}`);
    return response.data.data;
  },

  // Search students
  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Student>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/students/search?${params}`);
    return response.data.data;
  },
};
