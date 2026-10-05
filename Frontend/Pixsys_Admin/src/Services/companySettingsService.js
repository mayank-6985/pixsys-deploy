import api from "../../api";

export const companySettingsApi = {
  getCompanySettings: async () => {
    const response = await api.get("auth/settings/company/");
    return response.data;
  },

  updateCompanySettings: async (settingsData) => {
    const payload = {};
    Object.entries(settingsData).forEach(([key, value]) => {
      // if (value && value.trim() !== "") {
      payload[key] = value ? value.trim() : "";
      // }
    });

    const response = await api.patch("auth/settings/company/", payload);
    return response.data;
  },

  getSmtpSettings: async () => {
    const response = await api.get("auth/admin/settings/smtp/");
    return response.data;
  },

  updateSmtpSettings: async (smtpData) => {
    const payload = {};
    if (smtpData.email_host_user)
      payload.email_host_user = smtpData.email_host_user;
    if (smtpData.email_host_password)
      payload.email_host_password = smtpData.email_host_password;

    const response = await api.patch("auth/admin/settings/smtp/", payload);
    return response.data;
  },
};
