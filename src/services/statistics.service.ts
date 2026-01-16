import api from "./api";

export interface QuickStats {
  totalRegions: number;
  totalColleges: number;
  totalDistrictHeads: number;
  totalStudents: number;
}

export interface DashboardStatistics {
  overview: {
    totalRegions: number;
    totalColleges: number;
    totalDistrictHeads: number;
    totalTeachers: number;
    totalStudents: number;
    totalPrograms: number;
    totalSections: number;
  };
  regions: {
    total: number;
    withDistrictHeads: number;
    withoutDistrictHeads: number;
    assignmentRate: number;
  };
  colleges: {
    total: number;
    active: number;
  };
  students: {
    total: number;
    active: number;
    inactive: number;
  };
  personnel: {
    totalDistrictHeads: number;
    totalTeachers: number;
  };
  academics: {
    totalPrograms: number;
    totalSections: number;
  };
}

export interface RegionStatistics {
  _id: string;
  name: string;
  code: string;
  totalColleges: number;
  hasDistrictHead: boolean;
}

export interface CollegeStatistics {
  _id: string;
  name: string;
  code: string;
  city: string;
  regionName: string;
  regionCode: string;
  totalTeachers: number;
  totalStudents: number;
  totalPrograms: number;
  totalSections: number;
}

export const statisticsService = {
  // Get quick stats for dashboard cards (optimized)
  getQuickStats: async (): Promise<QuickStats> => {
    const response = await api.get("/statistics/quick");
    return response.data.data;
  },

  // Get comprehensive dashboard statistics
  getDashboardStats: async (): Promise<DashboardStatistics> => {
    const response = await api.get("/statistics/dashboard");
    return response.data.data;
  },

  // Get region-wise statistics
  getRegionStats: async (): Promise<RegionStatistics[]> => {
    const response = await api.get("/statistics/regions");
    return response.data.data.regions;
  },

  // Get college-wise statistics
  getCollegeStats: async (regionId?: string): Promise<CollegeStatistics[]> => {
    const params = regionId ? `?regionId=${regionId}` : "";
    const response = await api.get(`/statistics/colleges${params}`);
    return response.data.data.colleges;
  },
};
