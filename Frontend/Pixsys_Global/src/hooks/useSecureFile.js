import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../Services/authService";

export const useSecureFile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Reusable Auth Guard
  const requireAuth = (callback) => {
    if (!authService.getAccessToken()) {
      navigate("/login", {
        state: { returnTo: location.pathname + location.search },
      });
      return false;
    }
    if (callback) callback();
    return true;
  };

  // 2. Centralized Download Logic
  const downloadSecureFile = async (url, customFilename) => {
    // Wrap the download attempt in our auth guard
    requireAuth(async () => {
      try {
        // NOTE FOR FUTURE SECURITY:
        // If your backend protects the actual files, you need to send the token.
        // Uncomment the headers below if your API requires it.

        /*
        const headers = new Headers();
        headers.append("Authorization", `Bearer ${authService.getAccessToken()}`);
        const response = await fetch(url, { method: "GET", headers });
        */

        // Standard fetch for files served from the backend's local media storage
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch file");

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download =
          customFilename || url.split("/").pop().split("?")[0] || "download";

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error(
          "Secure download failed, falling back to new tab:",
          error,
        );
        window.open(url, "_blank");
      }
    });
  };

  return { requireAuth, downloadSecureFile };
};
