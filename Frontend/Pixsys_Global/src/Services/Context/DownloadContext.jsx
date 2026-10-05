import React, { createContext, useContext, useState } from "react";

const DownloadContext = createContext();

export const DownloadProvider = ({ children }) => {
  const [downloadProgress, setDownloadProgress] = useState({});

  const forceDownload = async (url, customFilename, fileId) => {
    try {
      setDownloadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      const response = await fetch(url, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch file");

      const contentLength = response.headers.get("content-length");
      const contentType = response.headers.get("content-type");
      let blob;

      if (!contentLength) {
        blob = await response.blob();
      } else {
        const total = parseInt(contentLength, 10);
        const reader = response.body.getReader();
        const chunks = [];
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;
          const percentCompleted = Math.round((receivedLength / total) * 100);

          setDownloadProgress((prev) => ({
            ...prev,
            [fileId]: percentCompleted,
          }));
        }
        blob = new Blob(chunks, { type: contentType });
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download =
        customFilename || url.split("/").pop().split("?")[0] || "download";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setTimeout(() => {
        setDownloadProgress((prev) => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
      }, 1000);
    } catch (error) {
      console.error("Forced download failed:", error);
      setDownloadProgress((prev) => {
        const newState = { ...prev };
        delete newState[fileId];
        return newState;
      });
      window.open(url, "_blank");
    }
  };

  return (
    <DownloadContext.Provider value={{ downloadProgress, forceDownload }}>
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloadManager = () => useContext(DownloadContext);
