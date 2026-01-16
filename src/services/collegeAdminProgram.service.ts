import api from "./api";

// Interfaces
export interface Program {
  _id: string;
  name: string;
  code: string;
  duration?: number;
  description?: string;
  college?: string;
  isActive?: boolean;
}

// Service functions
export const collegeAdminProgramService = {
  /**
   * Get all programs for the college
   * Uses the statistics API to extract program data
   */
  async getAll(): Promise<Program[]> {
    try {
      const response = await api.get("/college-admin/statistics/programs");
      const programs = response.data.data || [];
      
      // Map statistics data to Program interface
      return programs.map((prog: any) => ({
        _id: prog._id,
        name: prog.name,
        code: prog.code || "",
        duration: prog.duration,
        isActive: true,
      }));
    } catch (error) {
      console.error("Failed to fetch programs:", error);
      return [];
    }
  },
};
