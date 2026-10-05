import axios from "axios";
import { authService } from "./src/Services/authService";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/v1/api/`,
  headers: {
    // "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await authService.refreshToken();

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Session expired. Please log in again.");
        authService.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
