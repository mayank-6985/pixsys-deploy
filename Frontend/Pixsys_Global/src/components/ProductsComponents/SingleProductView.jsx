import React, { useState } from "react";
import { HiOutlineArrowLeft, HiOutlineDownload } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../Services/authService";
import { useDownloadManager } from "../../Services/Context/DownloadContext";
const SingleProductView = ({ product, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const navigate = useNavigate();
  const location = useLocation();
  const { downloadProgress, forceDownload } = useDownloadManager();

  const handleSecureAction = (e, callback) => {
    e.preventDefault();

    if (!authService.getAccessToken()) {
      const fullCurrentUrl = location.pathname + location.search;

      navigate("/login", {
        state: { returnTo: fullCurrentUrl },
      });
      return;
    }

    if (callback) callback();
  };

  if (!product) return null;

  const downloadTabs =
    product.downloads && typeof product.downloads === "object"
      ? Object.keys(product.downloads)
      : [];

  const hasSpecifications =
    product.specifications && product.specifications.length > 0;

  const allTabs = ["overview"];
  if (hasSpecifications) allTabs.push("specifications");
  allTabs.push(...downloadTabs);

  // const forceDownload = async (url, customFilename) => {
  //   try {
  //     const response = await fetch(url, { method: "GET" });
  //     if (!response.ok) throw new Error("Failed to fetch file");

  //     const blob = await response.blob();
  //     const blobUrl = window.URL.createObjectURL(blob);

  //     const link = document.createElement("a");
  //     link.href = blobUrl;

  //     link.download =
  //       customFilename || url.split("/").pop().split("?")[0] || "download";

  //     document.body.appendChild(link);
  //     link.click();

  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(blobUrl);
  //   } catch (error) {
  //     console.error("Forced download failed, falling back to new tab:", error);
  //     window.open(url, "_blank");
  //   }
  // };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-gray-500 hover:text-[#da0e19] transition-colors mb-6"
      >
        <HiOutlineArrowLeft className="mr-2 text-lg" /> Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
          <img
            src={product.product_img}
            alt={product.name}
            className="max-h-80 object-contain mix-blend-multiply"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <h3 className="text-xl text-gray-500 font-medium mb-8">
            {product.tagline}
          </h3>
          <div className="w-16 h-1 bg-[#da0e19]"></div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 mb-8 gap-8 overflow-x-auto scrollbar-hide">
          {allTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm md:text-base font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "text-[#da0e19] border-b-[3px] border-[#da0e19]"
                  : "text-gray-400 hover:text-gray-900"
              }`}
            >
              {tab.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="min-h-[300px]">
          {activeTab === "overview" && (
            <div className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="grid grid-cols-1 gap-4">
              {product.specifications.map((url, idx) => (
                <div
                  key={idx}
                  className="w-full overflow-hidden rounded-xl border border-gray-100 shadow-sm"
                >
                  <img
                    src={url}
                    alt={`Specification ${idx + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          )}

          {downloadTabs.includes(activeTab) && product.downloads[activeTab] && (
            <div className="grid grid-cols-1 gap-4 ">
              {product.downloads[activeTab].map((item, index) => {
                // Industry Standard: Provide a guaranteed unique ID fallback to prevent state collisions
                const uniqueId =
                  item.download_id || item.id || `download_${index}`;

                return (
                  <div
                    key={uniqueId}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 border border-gray-100 rounded-lg hover:border-[#da0e19] hover:shadow-md transition-all group"
                  >
                    <div className="mb-4 sm:mb-0">
                      <h4 className="text-base font-bold text-gray-900 group-hover:text-[#da0e19] transition-colors uppercase">
                        {item.name}
                      </h4>
                    </div>

                    <button
                      onClick={(e) =>
                        handleSecureAction(e, () =>
                          forceDownload(item.resource_url, item.name, uniqueId),
                        )
                      }
                      disabled={downloadProgress[uniqueId] !== undefined}
                      className="flex items-center justify-center gap-2 bg-gray-50 group-hover:bg-[#da0e19] text-gray-600 group-hover:text-white px-6 py-2.5 rounded font-bold text-sm transition-all disabled:bg-gray-100 disabled:text-[#da0e19] disabled:cursor-wait"
                    >
                      {downloadProgress[uniqueId] !== undefined ? (
                        <span className="animate-pulse">
                          Downloading {downloadProgress[uniqueId]}%
                        </span>
                      ) : (
                        <>
                          Download File{" "}
                          <HiOutlineDownload className="text-lg" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleProductView;
