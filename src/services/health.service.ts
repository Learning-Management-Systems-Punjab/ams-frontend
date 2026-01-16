import api from "./api";

export const healthService = {
  check: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
