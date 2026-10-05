import api from "../../api";

const TOKEN_KEYS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
};

export const authService = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEYS.ACCESS),

  getRefreshToken: () => localStorage.getItem(TOKEN_KEYS.REFRESH),

  setTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
    if (refreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
  },

  login: async (credentials) => {
    const response = await api.post(`auth/admin/login/`, credentials);

    const accessToken = response.data?.access || response.data?.accessToken;
    const refreshToken = response.data?.refresh || response.data?.refreshToken;

    if (!accessToken) {
      console.error("Backend Response Data:", response.data);
      throw new Error(
        "Token keys did not match backend response. Check console.",
      );
    }

    authService.setTokens(accessToken, refreshToken);
    return response.data;
  },

  refreshToken: async () => {
    const currentRefresh = authService.getRefreshToken();

    if (!currentRefresh) {
      throw new Error("No refresh token available");
    }

    const response = await api.post(`auth/token/refresh/`, {
      refresh: currentRefresh,
    });

    const newAccessToken = response.data?.access || response.data?.accessToken;
    const newRefreshToken =
      response.data?.refresh || response.data?.refreshToken || currentRefresh;

    if (!newAccessToken) {
      throw new Error("Failed to retrieve new access token.");
    }

    authService.setTokens(newAccessToken, newRefreshToken);

    return newAccessToken;
  },

  logout: () => {
    authService.clearTokens();
    window.dispatchEvent(new Event("auth:admin:logout"));
  },
};
