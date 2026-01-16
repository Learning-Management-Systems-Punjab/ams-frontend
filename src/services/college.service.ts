import api from "./api";

export interface College {
  _id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  establishedYear?: number;
  regionId:
    | string
    | {
        _id: string;
        name: string;
        code: string;
      };
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  region?: {
    _id: string;
    name: string;
    code: string;
  };
}

export interface CreateCollegeDto {
  name: string;
  code: string;
  regionId: string;
  address: string;
  city: string;
  establishedYear?: number;
  email: string;
  password: string;
}

export interface UpdateCollegeDto {
  name?: string;
  code?: string;
  regionId?: string;
  address?: string;
  city?: string;
  establishedYear?: number;
  isActive?: boolean;
}

export interface CollegeCreateResponse {
  college: College;
  credentials: {
    email: string;
    password: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const collegeService = {
  // Get all colleges with pagination
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<College>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/colleges?${params}`);

    // Transform backend response structure
    const backendData = response.data.data;
    return {
      data: backendData.colleges || [],
      total: backendData.pagination?.totalItems || 0,
      page: backendData.pagination?.currentPage || page,
      limit: backendData.pagination?.perPage || limit,
      totalPages: backendData.pagination?.totalPages || 1,
    };
  },

  // Get college by ID
  getById: async (collegeId: string): Promise<College> => {
    const response = await api.get(`/colleges/${collegeId}`);
    return response.data.data;
  },

  // Search colleges
  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<College>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/colleges/search?${params}`);

    // Transform backend response structure
    const backendData = response.data.data;
    return {
      data: backendData.colleges || [],
      total: backendData.pagination?.totalItems || 0,
      page: backendData.pagination?.currentPage || page,
      limit: backendData.pagination?.perPage || limit,
      totalPages: backendData.pagination?.totalPages || 1,
    };
  },

  // Create college
  create: async (data: CreateCollegeDto): Promise<CollegeCreateResponse> => {
    const response = await api.post("/colleges", data);
    return response.data.data;
  },

  // Update college
  update: async (
    collegeId: string,
    data: UpdateCollegeDto
  ): Promise<College> => {
    const response = await api.put(`/colleges/${collegeId}`, data);
    return response.data.data;
  },

  // Delete college (soft delete by setting isActive to false)
  delete: async (collegeId: string): Promise<void> => {
    await api.put(`/colleges/${collegeId}`, { isActive: false });
  },
};
