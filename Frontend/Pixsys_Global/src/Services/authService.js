import api from "../api";

const TOKEN_KEYS = {
  ACCESS: "global_accessToken",
  REFRESH: "global_refreshToken",
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

  signUp: async (data) => {
    const response = await api.post(`auth/customer/signup/`, data);
    return response.data;
  },

  loginInitiate: async (credentials) => {
    const response = await api.post(
      `auth/customer/login/initiate/`,
      credentials,
    );
    return response.data;
  },

  loginVerify: async (data) => {
    const response = await api.post(`auth/customer/login/verify/`, data);

    const accessToken = response.data?.access || response.data?.accessToken;
    const refreshToken = response.data?.refresh || response.data?.refreshToken;

    if (!accessToken) {
      throw new Error("Token keys did not match backend response.");
    }

    authService.setTokens(accessToken, refreshToken);
    return response.data;
  },

  resendOtp: async (email) => {
    const response = await api.post(`auth/customer/otp/resend/`, {
      email,
    });
    return response.data;
  },

  refreshToken: async () => {
    const currentRefresh = authService.getRefreshToken();
    if (!currentRefresh) throw new Error("No refresh token available");

    const response = await api.post(`auth/refresh/`, {
      refresh: currentRefresh,
    });

    const newAccessToken = response.data?.access || response.data?.accessToken;
    const newRefreshToken =
      response.data?.refresh || response.data?.refreshToken || currentRefresh;

    authService.setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  },

  passwordResetRequest: async (email) => {
    const response = await api.post(`auth/customer/password/reset/request/`, { email });
    return response.data;
  },

  passwordResetVerify: async (data) => {
    const response = await api.post(`auth/customer/password/reset/verify/`, data);
    return response.data;
  },

  passwordResetConfirm: async (data) => {
    const response = await api.post(`auth/customer/password/reset/confirm/`, data);
    return response.data;
  },

  logout: () => {
    authService.clearTokens();
  },
};
