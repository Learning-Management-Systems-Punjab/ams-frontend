import api from "./api";

export interface Region {
  _id: string;
  name: string;
  code: string;
  description?: string;
  districtHeadId?:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegionDto {
  name: string;
  code: string;
  description?: string;
  districtHeadId?: string;
}

export interface UpdateRegionDto {
  name?: string;
  code?: string;
  description?: string;
  districtHeadId?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const regionService = {
  // Get all regions with pagination
  getAll: async (
    page = 1,
    limit = 10,
    search = ""
  ): Promise<PaginatedResponse<Region>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    const response = await api.get(`/regions?${params}`);
    console.log("Raw API response:", response.data);

    // Backend returns { success, message, data: { regions, pagination } }
    const backendData = response.data.data;

    // Transform to match our interface
    return {
      data: backendData.regions || [],
      total: backendData.pagination?.totalItems || 0,
      page: backendData.pagination?.currentPage || page,
      limit: backendData.pagination?.perPage || limit,
      totalPages: backendData.pagination?.totalPages || 1,
    };
  },

  // Get region by ID
  getById: async (id: string): Promise<Region> => {
    const response = await api.get(`/regions/${id}`);
    return response.data.data;
  },

  // Create region
  create: async (data: CreateRegionDto): Promise<Region> => {
    const response = await api.post("/regions", data);
    return response.data.data;
  },

  // Update region
  update: async (id: string, data: UpdateRegionDto): Promise<Region> => {
    const response = await api.put(`/regions/${id}`, data);
    return response.data.data;
  },

  // Delete region
  delete: async (id: string): Promise<void> => {
    await api.delete(`/regions/${id}`);
  },
};
