import { useState } from "react";
import { apiService } from "../Services/uploadService";

// ──────────────────────────────────────────────────
// Allowed file types & max size (client-side pre-validation)
// Keep in sync with the backend's ALLOWED_EXTENSIONS / MAX_FILE_SIZE.
// ──────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
  ".dxf", ".dwg", ".stp", ".step",
  ".pdf", ".xml", ".eds",
  ".zip", ".rar", ".7z",
  ".exe", ".msi",
]);

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

/**
 * React hook for uploading files to the backend's local storage.
 * Drop-in replacement for the removed useS3Upload hook.
 *
 * @param {string} folderName – sub-folder inside /media/ (e.g. "news").
 */
export const useFileUpload = (folderName = "general") => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    if (!file) return null;

    // ── Client-side pre-validation ─────────────────
    const ext = `.${file.name.split(".").pop().toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      const msg = `File extension "${ext}" is not allowed.`;
      setError(msg);
      throw new Error(msg);
    }

    // if (file.size > MAX_FILE_SIZE) {
    //   const msg = `File exceeds the maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)} MB.`;
    //   setError(msg);
    //   throw new Error(msg);
    // }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Sanitise the filename (keep only safe characters)
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const safeFile = new File([file], cleanFileName, { type: file.type });

      // Determine MIME fallback for exotic file types the browser can't detect
      let uploadFile = safeFile;
      if (!safeFile.type) {
        const fallbackMimeTypes = {
          stp: "application/step",
          dxf: "image/vnd.dxf",
          dwg: "image/vnd.dwg",
          rar: "application/vnd.rar",
          zip: "application/zip",
          xml: "application/xml",
          eds: "application/octet-stream",
        };
        const bareExt = cleanFileName.split(".").pop().toLowerCase();
        const determinedType = fallbackMimeTypes[bareExt] || "application/octet-stream";
        uploadFile = new File([safeFile], cleanFileName, { type: determinedType });
      }

      const finalUrl = await apiService.uploadFile(
        uploadFile,
        folderName,
        setProgress,
      );

      setIsUploading(false);
      setProgress(100);

      return finalUrl;
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.error || err.message || "Failed to upload file.");
      setIsUploading(false);
      throw err;
    }
  };

  return { uploadFile, isUploading, progress, error };
};
