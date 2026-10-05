import api from "../../api";

export const apiService = {
  getSliderImages: async () => {
    const response = await api.get(`home/`);
    return response.data.slideImages || response.data;
  },

  updateSliderInDB: async (newImagesArray) => {
    const response = await api.post(`home/`, {
      slideImages: newImagesArray,
    });
    return response.data;
  },

  /**
   * Upload a file directly to the backend's local storage.
   * Replaces the old S3 presigned-URL → PUT flow with a single
   * multipart/form-data POST to /v1/api/utils/upload/.
   *
   * @param {File}     file        - The file object to upload.
   * @param {string}   folderName  - Sub-folder inside /media/ (e.g. "news", "products").
   * @param {Function} onProgress  - Optional callback receiving upload percentage (0-100).
   * @returns {string} The public URL of the uploaded file.
   */
  uploadFile: async (file, folderName = "general", onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folderName);

    const response = await api.post("utils/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });

    // The backend returns { file_url: "/media/folder/uuid.ext", message: "..." }
    // Construct the full URL using the API base URL.
    const relativeUrl = response.data.file_url;
    const apiBase = import.meta.env.VITE_API_URL || "";
    return `${apiBase}${relativeUrl}`;
  },
};
