import api from "/api.js";

export const fetchAllDownloads = async () => {
  const response = await api.get("downloads/");
  return response.data;
};

export const updateDownload = async (data) => {
  const { download_id, ...payload } = data;

  const formattedPayload = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (
        ["product_id", "tag_id", "subcategory_id", "category_id"].includes(key)
      ) {
        return [key, value === "" ? null : parseInt(value, 10)];
      }
      return [key, value];
    }),
  );

  const response = await api.put(`downloads/${download_id}/`, formattedPayload);
  return response.data;
};

export const deleteDownload = async (download_id) => {
  const response = await api.delete(`downloads/${download_id}/`);
  return response.data;
};

export const createDownload = async (data) => {
  const formattedPayload = Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (
        ["product_id", "tag_id", "subcategory_id", "category_id"].includes(key)
      ) {
        return [key, value === "" ? null : parseInt(value, 10)];
      }
      return [key, value];
    }),
  );

  const response = await api.post("downloads/", formattedPayload);
  return response.data;
};

export const createResource = async (data) => {
  const formattedPayload = Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (
        ["product_id", "tag_id", "subcategory_id", "category_id"].includes(key)
      ) {
        return [key, value === "" ? null : parseInt(value, 10)];
      }
      return [key, value];
    }),
  );
  const response = await api.post("resources/update/", formattedPayload);
  return response.data;
};

export const updateResource = async (data) => {
  const { resource_id, name, description, thumbnail, resource_url } = data;
  const payload = { resource_id, name, description, thumbnail, resource_url };

  const response = await api.put("resources/update/", payload);
  return response.data;
};

export const deleteResource = async (resource_id) => {
  const response = await api.delete(
    `resources/update/?resource_id=${resource_id}`,
  );
  return response.data;
};
