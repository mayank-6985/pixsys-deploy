import api from "../api";

export const fetchLinks = async () => {
  try {
    const response = await api.get("auth/settings/company/");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to fetch links");
  }
};
