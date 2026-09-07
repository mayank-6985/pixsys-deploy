import React, { useState, useMemo } from "react";
import { FaHome } from "react-icons/fa";
import { HiOutlineDownload } from "react-icons/hi";
import { FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useProducts, useCategoryDetails } from "../hooks/useProducts";
import { useAllDownloads } from "../hooks/useDownload";
import { authService } from "../Services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
const Downloads = () => {
  const { data: mainCategories, isLoading: isCatLoading } = useProducts();
  const { data: rawDownloads, isLoading: isDlLoading } = useAllDownloads();

  const [selectedCat, setSelectedCat] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedProd, setSelectedProd] = useState("");
  const [downloadProgress, setDownloadProgress] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const { data: categoryDetails } = useCategoryDetails(selectedCat);

  const [selectedTypes, setSelectedTypes] = useState([]);

  const handleCatChange = (e) => {
    setSelectedCat(e.target.value);
    setSelectedSub("");
    setSelectedTag("");
    setSelectedProd("");
  };

  const handleSubChange = (e) => {
    setSelectedSub(e.target.value);
    setSelectedTag("");
    setSelectedProd("");
  };

  const handleTagChange = (e) => {
    setSelectedTag(e.target.value);
    setSelectedProd("");
  };

  // const handleSecureAction = (e, callback) => {
  //   if (!authService.getAccessToken()) {
  //     e.preventDefault();
  //     navigate("/login", { state: { returnTo: window.location.pathname } });
  //     return;
  //   }
  //   if (callback) callback();
  // };

  const handleSecureAction = (e, callback) => {
    if (!authService.getAccessToken()) {
      e.preventDefault();
      const fullCurrentUrl = location.pathname + location.search;

      navigate("/login", { state: { returnTo: fullCurrentUrl } });
      return;
    }
    if (callback) callback();
  };

  const catOptions = mainCategories || [];
  const subOptions = useMemo(
    () =>
      catOptions.find((c) => String(c.category_id) === String(selectedCat))
        ?.subcategories || [],
    [catOptions, selectedCat],
  );
  const tagOptions = useMemo(
    () =>
      subOptions.find((s) => String(s.subcategory_id) === String(selectedSub))
        ?.tags || [],
    [subOptions, selectedSub],
  );
  const prodOptions = useMemo(() => {
    if (!categoryDetails || !selectedTag) return [];
    for (const sub of categoryDetails) {
      const tag = sub.tags?.find(
        (t) => String(t.tag_id) === String(selectedTag),
      );
      if (tag && tag.products) return tag.products;
    }
    return [];
  }, [categoryDetails, selectedTag]);

  const apiDownloads = useMemo(() => {
    if (!rawDownloads) return [];
    let data = rawDownloads.data || rawDownloads.results || rawDownloads;
    let extracted = [];

    if (typeof data === "object" && !Array.isArray(data) && data !== null) {
      Object.values(data).forEach((arr) => {
        if (Array.isArray(arr)) extracted.push(...arr);
      });
    }
    return extracted.filter((item) => item && item.resource_type);
  }, [rawDownloads]);

  const specDownloads = useMemo(() => {
    let specs = [];
    if (!categoryDetails) return specs;

    categoryDetails.forEach((sub) => {
      (sub.tags || []).forEach((tag) => {
        (tag.products || []).forEach((prod) => {
          if (prod.specifications && prod.specifications.length > 0) {
            prod.specifications.forEach((specUrl, idx) => {
              specs.push({
                download_id: `spec-${prod.product_id}-${idx}`,
                name: `${prod.name} - Specification Document ${idx + 1}`,
                resource_url: specUrl,
                resource_type: "SPECIFICATIONS",
                product_id: prod.product_id,
                tag_id: tag.tag_id,
                subcategory_id: sub.subcategory_id,
                category_id: Number(selectedCat),
              });
            });
          }
        });
      });
    });
    return specs;
  }, [categoryDetails, selectedCat]);

  const allDownloads = useMemo(
    () => [...apiDownloads, ...specDownloads],
    [apiDownloads, specDownloads],
  );

  const availableTypes = useMemo(() => {
    const types = new Set(
      allDownloads.map((d) => d.resource_type).filter(Boolean),
    );
    return Array.from(types).sort();
  }, [allDownloads]);

  const handleCheckboxChange = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const getProductName = (productId) => {
    if (categoryDetails) {
      for (const sub of categoryDetails) {
        for (const tag of sub.tags || []) {
          const prod = (tag.products || []).find(
            (p) => String(p.product_id) === String(productId),
          );
          if (prod) return prod.name;
        }
      }
    }
    return `Product ID: ${productId}`;
  };

  // const filteredDownloads = useMemo(() => {
  //   if (
  //     !selectedCat &&
  //     !selectedSub &&
  //     !selectedTag &&
  //     !selectedProd &&
  //     selectedTypes.length === 0
  //   ) {
  //     return allDownloads;
  //   }

  //   return allDownloads.filter((doc) => {
  //     if (selectedCat && String(doc.category_id) !== String(selectedCat))
  //       return false;
  //     if (selectedSub && String(doc.subcategory_id) !== String(selectedSub))
  //       return false;
  //     if (selectedTag && String(doc.tag_id) !== String(selectedTag))
  //       return false;
  //     if (selectedProd && String(doc.product_id) !== String(selectedProd))
  //       return false;

  //     if (
  //       selectedTypes.length > 0 &&
  //       !selectedTypes.includes(doc.resource_type)
  //     )
  //       return false;

  //     return true;
  //   });
  // }, [
  //   allDownloads,
  //   selectedCat,
  //   selectedSub,
  //   selectedTag,
  //   selectedProd,
  //   selectedTypes,
  // ]);



  const filteredDownloads = useMemo(() => {
    const baseFiltered = allDownloads.filter((doc) => {
      if (selectedCat && String(doc.category_id) !== String(selectedCat))
        return false;
      if (selectedSub && String(doc.subcategory_id) !== String(selectedSub))
        return false;
      if (selectedTag && String(doc.tag_id) !== String(selectedTag))
        return false;
      if (selectedProd && String(doc.product_id) !== String(selectedProd))
        return false;
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes(doc.resource_type)
      )
        return false;

      return true;
    });

    const downloadsHashMap = new Map();

    for (const doc of baseFiltered) {
      const hashKey = doc.name ? doc.name.trim().toLowerCase() : doc.resource_url;

      if (!downloadsHashMap.has(hashKey)) {
        downloadsHashMap.set(hashKey, doc);
      }
    }

    return Array.from(downloadsHashMap.values());
  }, [
    allDownloads,
    selectedCat,
    selectedSub,
    selectedTag,
    selectedProd,
    selectedTypes,
  ]);


  const groupedDownloads = useMemo(() => {
    const groups = {};
    filteredDownloads.forEach((doc) => {
      if (!groups[doc.resource_type]) groups[doc.resource_type] = [];
      groups[doc.resource_type].push(doc);
    });
    return groups;
  }, [filteredDownloads]);

  const forceDownload = async (url, customFilename) => {
    const fileId = url;

    try {
      setDownloadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      const response = await api.get(url, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) /
            (progressEvent.total || progressEvent.loaded),
          );
          setDownloadProgress((prev) => ({
            ...prev,
            [fileId]: percentCompleted,
          }));
        },
      });
      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const rawExtension = url.split(/[#?]/)[0].split(".").pop().trim();
      let finalFilename = customFilename || "download";

      if (
        rawExtension &&
        !finalFilename.toLowerCase().endsWith(`.${rawExtension.toLowerCase()}`)
      ) {
        finalFilename = `${finalFilename}.${rawExtension}`;
      }

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", finalFilename);

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
      console.error("Download failed:", error);
      setDownloadProgress((prev) => {
        const newState = { ...prev };
        delete newState[fileId];
        return newState;
      });
      // Fallback
      window.open(url, "_blank");
    }
  };

  const getMimeType = (url) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes(".pdf")) return "application/pdf";
    if (lowerUrl.includes(".jpg") || lowerUrl.includes(".jpeg"))
      return "image/jpeg";
    if (lowerUrl.includes(".png")) return "image/png";
    if (lowerUrl.includes(".txt")) return "text/plain";
    return null;
  };

  const forceView = async (url) => {
    const newTab = window.open("", "_blank");
    if (!newTab) {
      alert("Please allow pop-ups for this site to view documents.");
      return;
    }

    newTab.document.write(
      "<html style='height:100%; display:flex; justify-content:center; align-items:center; background:#fafafa; font-family:sans-serif;'><h2>Loading secure document...</h2></html>",
    );

    try {
      const response = await api.get(url, { responseType: "blob" });

      const blobType =
        getMimeType(url) || response.data.type || "application/pdf";
      const blob = new Blob([response.data], { type: blobType });
      const blobUrl = window.URL.createObjectURL(blob);

      newTab.location.href = blobUrl;
    } catch (error) {
      console.error("Secure view failed. Falling back to direct URL.", error);
      newTab.location.href = url;
    }
  };

  if (isCatLoading || isDlLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        Loading Download Center...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      <div className="bg-[#0f172a] py-16 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Download Center
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Access manuals, software, specifications, and CAD drawings for all our
          products.
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm border-b pb-3">
              Product Hierarchy
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Main Category
                </label>
                <select
                  value={selectedCat}
                  onChange={handleCatChange}
                  className="w-full border border-gray-300 rounded p-2.5 text-sm focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none"
                >
                  <option value="">All Categories</option>
                  {catOptions.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Sub Category
                </label>
                <select
                  value={selectedSub}
                  onChange={handleSubChange}
                  disabled={!selectedCat || subOptions.length === 0}
                  className="w-full border border-gray-300 rounded p-2.5 text-sm focus:border-[#da0e19] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Sub Categories</option>
                  {subOptions.map((s) => (
                    <option key={s.subcategory_id} value={s.subcategory_id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Series / Tag
                </label>
                <select
                  value={selectedTag}
                  onChange={handleTagChange}
                  disabled={!selectedSub || tagOptions.length === 0}
                  className="w-full border border-gray-300 rounded p-2.5 text-sm focus:border-[#da0e19] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Series</option>
                  {tagOptions.map((t) => (
                    <option key={t.tag_id} value={t.tag_id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Specific Product
                </label>
                <select
                  value={selectedProd}
                  onChange={(e) => setSelectedProd(e.target.value)}
                  disabled={!selectedTag || prodOptions.length === 0}
                  className="w-full border border-gray-300 rounded p-2.5 text-sm focus:border-[#da0e19] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">All Products</option>
                  {prodOptions.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm border-b pb-3">
              Document Type
            </h3>
            {availableTypes.length > 0 ? (
              <div className="space-y-3">
                {availableTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleCheckboxChange(type)}
                      className="w-4 h-4 text-[#da0e19] border-gray-300 rounded focus:ring-[#da0e19] accent-[#da0e19] cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#da0e19] transition-colors">
                      {type.replace(/_/g, " ")}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                No files available.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-10">
          {Object.keys(groupedDownloads).length > 0 ? (
            Object.keys(groupedDownloads)
              .sort()
              .map((type) => (
                <div
                  key={type}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#da0e19] uppercase tracking-wider">
                      {type.replace(/_/g, " ")}
                    </h2>
                    <span className="text-sm font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
                      {groupedDownloads[type].length} Files
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="hidden md:table-header-group">
                        <tr className="bg-white border-b border-gray-100">
                          <th className="px-6 py-4 text-sm font-semibold text-gray-500 w-[50%]">
                            Document Details
                          </th>
                          {/* <th className="px-6 py-4 text-sm font-semibold text-gray-500 w-[20%]">
                            Product ID
                          </th> */}
                          <th className="px-6 py-4 text-sm font-semibold text-gray-500 text-right w-[30%]">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {groupedDownloads[type].map((doc) => (
                          <tr
                            key={doc.download_id}
                            className="flex flex-wrap md:table-row hover:bg-red-50 transition-colors group p-4 md:p-0 border-b border-gray-100 md:border-none"
                          >
                            <td className="w-full md:w-auto block md:table-cell md:px-6 md:py-4 mb-1 md:mb-0 align-middle">
                              <div className="font-bold text-gray-900 group-hover:text-[#da0e19] transition-colors text-lg md:text-base">
                                {doc.name}
                              </div>
                            </td>

                            {/* <td className="w-full md:w-auto block md:table-cell md:px-6 md:py-4 text-sm font-mono text-gray-500 mb-4 md:mb-0 border-b border-gray-100 md:border-none pb-4 md:pb-0 align-middle">
                              <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-2">
                                Product:
                              </span>
                              {getProductName(doc.product_id)}
                            </td> */}

                            <td className="w-full md:w-auto block md:table-cell md:px-6 md:py-4 pt-4 md:pt-0 align-middle">
                              <div className="flex items-center md:justify-end gap-3 w-full">
                                <button
                                  onClick={(e) =>
                                    handleSecureAction(e, () =>
                                      forceView(doc.resource_url),
                                    )
                                  }
                                  // onClick={() => forceView(doc.resource_url)}
                                  className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 px-4 py-2.5 md:py-2 rounded border border-gray-300 text-gray-700 hover:border-[#da0e19] hover:text-[#da0e19] transition-all text-xs font-bold uppercase tracking-widest bg-gray-50 hover:bg-white"
                                >
                                  <FiEye size={14} />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={(e) =>
                                    handleSecureAction(e, () =>
                                      forceDownload(doc.resource_url, doc.name),
                                    )
                                  }
                                  // onClick={() =>
                                  //   forceDownload(doc.resource_url, doc.name)
                                  // }
                                  disabled={
                                    downloadProgress[doc.resource_url] !==
                                    undefined
                                  }
                                  className={`flex-1 md:flex-none inline-flex justify-center items-center gap-2 px-4 py-2.5 md:py-2 bg-white border rounded text-xs md:text-sm font-bold shadow-sm transition-all ${downloadProgress[doc.resource_url] !==
                                    undefined
                                    ? "border-gray-300 text-[#da0e19] cursor-wait"
                                    : "border-gray-200 text-gray-700 hover:border-[#da0e19] hover:text-[#da0e19] hover:shadow"
                                    }`}
                                >
                                  {downloadProgress[doc.resource_url] !==
                                    undefined ? (
                                    <span className="animate-pulse">
                                      {downloadProgress[doc.resource_url]}%
                                    </span>
                                  ) : (
                                    <>
                                      <span className="hidden sm:inline">
                                        Download
                                      </span>
                                      <span className="sm:hidden uppercase tracking-widest text-xs">
                                        Save
                                      </span>
                                      <HiOutlineDownload className="text-lg" />
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center h-[500px] flex flex-col justify-center items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <HiOutlineDownload className="text-4xl text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Select a category on the left to view specific documents, or
                clear your filters to view all global downloads.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Downloads;
