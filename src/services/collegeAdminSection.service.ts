import api from "./api";

// Interfaces
export interface Section {
  _id: string;
  name: string;
  year: string;
  shift: string;
  program?: string;
  college?: string;
  isActive?: boolean;
}

// Service functions
export const collegeAdminSectionService = {
  /**
   * Get all sections for the college
   * Uses the statistics API to extract section data
   */
  async getAll(): Promise<Section[]> {
    try {
      const response = await api.get("/college-admin/statistics/sections");
      const sections = response.data.data || [];
      
      // Map statistics data to Section interface
      return sections.map((sec: any) => ({
        _id: sec._id,
        name: sec.name,
        year: sec.semester || "N/A", // backend uses 'semester' field
        shift: sec.shift || "N/A",
        program: sec.programId,
        isActive: true,
      }));
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      return [];
    }
  },
};
