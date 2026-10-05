import { useState } from "react";
import { apiService } from "../Services/uploadService";

export const useHomes = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const executeUpload = async (file, currentSliderImages, onSuccess) => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Upload directly to backend local storage (replaces old S3 flow)
      const finalFileUrl = await apiService.uploadFile(
        file,
        "slider",
        setProgress,
      );

      if (!finalFileUrl) {
        throw new Error("Backend did not return a valid file URL.");
      }

      const updatedSliderArray = [...currentSliderImages, finalFileUrl];

      await apiService.updateSliderInDB(updatedSliderArray);

      setIsUploading(false);
      setProgress(100);

      if (onSuccess) onSuccess(updatedSliderArray);
    } catch (err) {
      console.error("Upload process failed:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to upload image.",
      );
      setIsUploading(false);
      throw err;
    }
  };
  return {
    executeUpload,
    isUploading,
    progress,
    error,
    resetState: () => {
      setProgress(0);
      setError(null);
    },
  };
};
