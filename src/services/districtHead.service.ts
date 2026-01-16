import api from "./api";

export interface DistrictHead {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        email: string;
        role: string;
      };
  regionId:
    | string
    | {
        _id: string;
        name: string;
        code: string;
      };
  name: string;
  email: string;
  cnic: string;
  phoneNumber?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    email: string;
    role: string;
  };
  region?: {
    _id: string;
    name: string;
    code: string;
  };
}

export interface CreateDistrictHeadDto {
  name: string;
  email: string;
  password: string;
  cnic: string;
  gender: string;
  phoneNumber?: string;
  address?: string;
  regionId: string;
}

export interface UpdateDistrictHeadDto {
  name?: string;
  email?: string;
  cnic?: string;
  phoneNumber?: string;
  address?: string;
  regionId?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PasswordResetResponse {
  message: string;
  newPassword: string;
}

export const districtHeadService = {
  // Get all district heads with pagination
  getAll: async (
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<DistrictHead>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/district-heads?${params}`);

    // Transform backend response structure to match frontend expectations
    const backendData = response.data.data;
    console.log("Backend response for getAll:", backendData);

    const transformedData = {
      data: backendData.districtHeads || [],
      total: backendData.pagination?.totalItems || 0,
      page: backendData.pagination?.currentPage || page,
      limit: backendData.pagination?.perPage || limit,
      totalPages: backendData.pagination?.totalPages || 1,
    };

    console.log("Transformed data for frontend:", transformedData);
    return transformedData;
  },

  // Get district head by user ID
  getById: async (userId: string): Promise<DistrictHead> => {
    const response = await api.get(`/district-heads/${userId}`);
    return response.data.data;
  },

  // Get district head by region
  getByRegion: async (regionId: string): Promise<DistrictHead> => {
    const response = await api.get(`/district-heads/region/${regionId}`);
    return response.data.data;
  },

  // Search district heads
  search: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<DistrictHead>> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get(`/district-heads/search?${params}`);

    // Transform backend response structure to match frontend expectations
    const backendData = response.data.data;
    return {
      data: backendData.districtHeads || [],
      total: backendData.pagination?.totalItems || 0,
      page: backendData.pagination?.currentPage || page,
      limit: backendData.pagination?.perPage || limit,
      totalPages: backendData.pagination?.totalPages || 1,
    };
  },

  // Create district head
  create: async (data: CreateDistrictHeadDto): Promise<DistrictHead> => {
    // Transform phoneNumber to contactNumber for backend compatibility
    const backendData = {
      name: data.name,
      email: data.email,
      password: data.password,
      cnic: data.cnic,
      gender: data.gender,
      contactNumber: data.phoneNumber, // Backend expects contactNumber
      address: data.address,
      regionId: data.regionId,
    };
    console.log("Sending to backend API:", backendData);
    const response = await api.post("/district-heads", backendData);
    console.log("Backend response:", response.data);
    return response.data.data;
  },

  // Update district head
  update: async (
    districtHeadId: string,
    data: UpdateDistrictHeadDto
  ): Promise<DistrictHead> => {
    // Transform phoneNumber to contactNumber for backend compatibility
    const backendData: any = {
      ...data,
    };
    if (data.phoneNumber !== undefined) {
      backendData.contactNumber = data.phoneNumber;
      delete backendData.phoneNumber;
    }
    const response = await api.put(
      `/district-heads/${districtHeadId}`,
      backendData
    );
    return response.data.data;
  },

  // Reset password
  resetPassword: async (
    districtHeadId: string
  ): Promise<PasswordResetResponse> => {
    const response = await api.post(
      `/district-heads/${districtHeadId}/reset-password`
    );
    return response.data.data;
  },

  // Export to CSV
  exportCSV: async (includePassword = false): Promise<Blob> => {
    const params = includePassword ? "?includePassword=true" : "";
    const response = await api.get(`/district-heads/export/csv${params}`, {
      responseType: "blob",
    });
    return response.data;
  },
};
