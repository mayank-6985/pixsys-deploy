import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useSearchResults } from "../hooks/useSearch";
import { FaHome } from "react-icons/fa";
import { authService } from "../Services/authService";
import api from "../api";
import {
  FiDownload,
  FiEye,
  FiSearch,
  FiArrowRight,
  FiPlay,
  FiX,
} from "react-icons/fi";
import { HiOutlineArrowLeft, HiOutlineDownload } from "react-icons/hi";

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// 1. Added forceDownload as a prop here
const SingleProductView = ({ product, onBack, forceDownload }) => {
  const [activeTab, setActiveTab] = useState("overview");

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
              {product.description ||
                "No description available for this product."}
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
            <div className="grid grid-cols-1 gap-4">
              {product.downloads[activeTab].map((item) => (
                <div
                  key={item.download_id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 border border-gray-100 rounded-lg hover:border-[#da0e19] hover:shadow-md transition-all group"
                >
                  <div className="mb-4 sm:mb-0">
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-[#da0e19] transition-colors uppercase">
                      {item.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => forceDownload(item.resource_url, item.name)}
                    className="flex items-center justify-center gap-2 bg-gray-50 group-hover:bg-[#da0e19] text-gray-600 group-hover:text-white px-6 py-2.5 rounded font-bold text-sm transition-all"
                  >
                    Download File <HiOutlineDownload className="text-lg" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SolutionVideoCard = ({ solution, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const ytId = getYoutubeId(solution.videoUrl);
  const isYouTube = !!ytId;

  useEffect(() => {
    if (!isYouTube && videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, isYouTube]);

  return (
    <div
      onClick={() => onClick({ ...solution, isYouTube, ytId })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer bg-white rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border border-gray-200"
    >
      <div className="relative aspect-video w-full bg-black overflow-hidden">
        {isYouTube ? (
          <>
            {isHovered ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0`}
                title={solution.title}
                className="w-full h-full pointer-events-none scale-150"
                allow="autoplay; encrypted-media"
                frameBorder="0"
              />
            ) : (
              <img
                src={
                  solution.thumbnail ||
                  `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
                }
                alt={solution.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </>
        ) : (
          <video
            ref={videoRef}
            src={solution.videoUrl}
            poster={solution.thumbnail}
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <FiPlay className="text-[#da0e19] ml-1" size={24} />
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-[17px] font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#da0e19] transition-colors">
          {solution.title}
        </h3>
        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
          {solution.description || "Click to watch the full demonstration."}
        </p>
        <div className="flex items-center justify-between text-gray-400 group-hover:text-[#da0e19] transition-colors mt-6 pt-4 border-t border-gray-100 w-full">
          <span className="text-[13px] font-bold uppercase tracking-widest">
            Watch Video
          </span>
          <FiPlay size={16} />
        </div>
      </div>
    </div>
  );
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 2. State & Functions properly moved to the main Search component
  const location = useLocation();
  const [downloadProgress, setDownloadProgress] = useState({});

  const handleSecureAction = (e, callback) => {
    if (!authService.getAccessToken()) {
      e.preventDefault();
      const fullCurrentUrl = location.pathname + location.search;
      navigate("/login", { state: { returnTo: fullCurrentUrl } });
      return;
    }
    if (callback) callback();
  };

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
      window.open(url, "_blank"); // Fallback
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

  const [activeTab, setActiveTab] = useState("downloads");
  const [downloadFilter, setDownloadFilter] = useState("ALL");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [activeVideoPopup, setActiveVideoPopup] = useState(null);

  const keyword = searchParams.get("keyword")?.trim() || "";
  const [searchInput, setSearchInput] = useState(keyword);

  const {
    data: searchData,
    isLoading,
    isError,
    error,
  } = useSearchResults(keyword);

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const results = useMemo(() => {
    const products = Array.isArray(searchData?.products)
      ? searchData.products
      : [];
    const news = Array.isArray(searchData?.news) ? searchData.news : [];
    const solutions = Array.isArray(searchData?.solutions)
      ? searchData.solutions
      : [];

    let downloads = [];
    if (Array.isArray(searchData?.downloads)) {
      downloads = searchData.downloads.flatMap((downloadGroup) => {
        if (!downloadGroup || typeof downloadGroup !== "object") return [];
        return Object.entries(downloadGroup).flatMap(
          ([resource_type, items]) =>
            Array.isArray(items)
              ? items.map((item) => ({ ...item, resource_type }))
              : [],
        );
      });
    }

    return { products, news, solutions, downloads };
  }, [searchData]);

  const availableDownloadCategories = useMemo(() => {
    const categories = new Set(results.downloads.map((d) => d.resource_type));
    return ["ALL", ...Array.from(categories).filter(Boolean)];
  }, [results.downloads]);

  const filteredDownloads = useMemo(() => {
    if (downloadFilter === "ALL") return results.downloads;
    return results.downloads.filter((d) => d.resource_type === downloadFilter);
  }, [results.downloads, downloadFilter]);

  const tabs = [
    { id: "downloads", label: "Download", count: results.downloads.length },
    { id: "products", label: "Products", count: results.products.length },
    { id: "solutions", label: "Solution", count: results.solutions.length },
    { id: "news", label: "News", count: results.news.length },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      {/* Dark Navy Hero Banner */}
      <div className="bg-[#111827] w-full pt-12 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-wide">
            Search Results
          </h1>
          <p className="text-gray-400 mb-8 text-sm md:text-base">
            Find manuals, software, specifications, and news across our catalog.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="max-w-[800px] mx-auto relative"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search..."
              className="w-full pl-6 pr-14 py-4 rounded bg-white/10 border border-gray-600 focus:outline-none focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] transition-all text-white placeholder-gray-400 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#da0e19] transition-colors"
            >
              <FiSearch size={22} />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">
          <Link
            to="/"
            className="text-[#da0e19] hover:underline flex items-center gap-1"
          >
            <FaHome size={14} /> HOME
          </Link>
          <span className="text-gray-400">/</span>
          <span>SEARCH RESULTS</span>
        </div>

        <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap bg-white px-6 rounded-t-lg shadow-sm pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedSolution(null);
                setSelectedProduct(null);
                setDownloadFilter("ALL");
              }}
              className={`pb-4 text-[14px] font-bold uppercase tracking-widest transition-colors duration-300 relative ${
                activeTab === tab.id
                  ? "text-[#da0e19]"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label} ({tab.count})
              <div
                className={`absolute bottom-0 left-0 w-full h-[3px] bg-[#da0e19] transition-transform duration-300 origin-left ${
                  activeTab === tab.id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="bg-white rounded-b-lg shadow-sm p-6 md:p-8 min-h-[400px]">
          {!keyword ? (
            <div className="py-20 text-center text-gray-500">
              Please enter a keyword to search our directory.
            </div>
          ) : isLoading ? (
            <div className="py-20 text-center text-gray-500">
              Searching for "{keyword}"...
            </div>
          ) : isError ? (
            <div className="py-20 text-center text-[#da0e19]">
              <p className="font-bold mb-2 uppercase tracking-widest">
                Search failed
              </p>
              <p className="text-sm">
                {error?.message || "Unable to query search results."}
              </p>
            </div>
          ) : (
            <div>
              {activeTab === "downloads" && (
                <div>
                  {results.downloads.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {availableDownloadCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setDownloadFilter(category)}
                          className={`px-4 py-2 rounded text-[12px] font-bold uppercase tracking-widest transition-all duration-300 border ${
                            downloadFilter === category
                              ? "bg-[#da0e19] text-white border-[#da0e19] shadow-md"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#da0e19] hover:text-[#da0e19]"
                          }`}
                        >
                          {category.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    {filteredDownloads.length > 0 ? (
                      filteredDownloads.map((download, idx) => (
                        <div
                          key={download.download_id || idx}
                          className="bg-white border border-gray-200 rounded p-5 hover:border-[#da0e19] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                          <div className="flex-1">
                            <h3 className="text-[16px] font-bold text-gray-900 mb-2">
                              {download.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-6 text-[13px] text-gray-500">
                              <span>
                                Category:{" "}
                                <span className="font-bold text-gray-700">
                                  {download.resource_type}
                                </span>
                              </span>
                              <span>
                                Update date:{" "}
                                <span className="text-gray-700">
                                  {new Date().toISOString().split("T")[0]}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={(e) =>
                                handleSecureAction(e, () =>
                                  forceView(download.resource_url),
                                )
                              }
                              className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:border-[#da0e19] hover:text-[#da0e19] transition-all text-xs font-bold uppercase tracking-widest bg-gray-50 hover:bg-white"
                            >
                              <FiEye size={14} />
                              <span>View</span>
                            </button>
                            <button
                              onClick={(e) =>
                                handleSecureAction(e, () =>
                                  forceDownload(
                                    download.resource_url,
                                    download.name,
                                  ),
                                )
                              }
                              disabled={
                                downloadProgress[download.resource_url] !==
                                undefined
                              }
                              className={`flex items-center gap-2 px-4 py-2 rounded border text-xs font-bold uppercase tracking-widest transition-all ${
                                downloadProgress[download.resource_url] !==
                                undefined
                                  ? "bg-white border-gray-300 text-[#da0e19] cursor-wait"
                                  : "bg-gray-50 border-gray-300 text-gray-700 hover:border-[#da0e19] hover:text-[#da0e19] hover:bg-white"
                              }`}
                            >
                              {downloadProgress[download.resource_url] !==
                              undefined ? (
                                <span className="animate-pulse">
                                  {downloadProgress[download.resource_url]}%
                                </span>
                              ) : (
                                <>
                                  <FiDownload size={14} />
                                  <span>Download</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-gray-500">
                        No matching downloads found for this category.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "products" && (
                <div>
                  {selectedProduct ? (
                    // 3. Passed forceDownload prop here to SingleProductView
                    <SingleProductView
                      product={selectedProduct}
                      onBack={() => setSelectedProduct(null)}
                      forceDownload={forceDownload}
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {results.products.length > 0 ? (
                        results.products.map((product) => (
                          <button
                            key={product.product_id}
                            onClick={() => setSelectedProduct(product)}
                            className="group text-left bg-white border border-gray-200 rounded-lg p-6 flex flex-col hover:border-[#da0e19] hover:shadow-lg transition-all duration-300 relative overflow-hidden w-full"
                          >
                            <div className="h-32 w-full mb-6 flex items-center justify-center">
                              <img
                                src={
                                  product.product_img ||
                                  "https://via.placeholder.com/150?text=No+Image"
                                }
                                alt={product.name}
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                              />
                            </div>
                            <h3 className="text-[16px] font-bold text-gray-900 mb-2 group-hover:text-[#da0e19] transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3 mb-6 flex-grow">
                              {product.tagline || product.description}
                            </p>
                            <div className="flex items-center justify-between text-gray-400 group-hover:text-[#da0e19] transition-colors mt-auto pt-4 border-t border-gray-100 w-full">
                              <span className="text-[12px] font-bold uppercase tracking-widest">
                                View Details
                              </span>
                              <FiArrowRight size={16} />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-20 text-gray-500">
                          No matching products found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "solutions" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.solutions.length > 0 ? (
                    results.solutions.map((solution, idx) => (
                      <SolutionVideoCard
                        key={solution.solutions_id || idx}
                        solution={solution}
                        onClick={(videoData) => setActiveVideoPopup(videoData)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 text-gray-500">
                      No matching solutions found.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "news" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.news.length > 0 ? (
                    results.news.map((article) => (
                      <Link
                        key={article.news_id || article.id}
                        to={`/news/${article.news_id || article.id}`}
                        className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#da0e19] hover:shadow-lg transition-all"
                      >
                        <div className="aspect-[3/2] bg-gray-100 overflow-hidden relative">
                          <img
                            src={
                              article.thumbnail ||
                              "https://via.placeholder.com/400x250?text=News+Image"
                            }
                            alt={article.heading || article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute top-4 left-4 bg-[#da0e19] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                            News
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="text-[12px] text-gray-400 font-bold tracking-widest mb-3 uppercase">
                            {article.date
                              ? article.date.split("T")[0]
                              : "2024.11.18"}
                          </div>
                          <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#da0e19] transition-colors leading-relaxed line-clamp-2">
                            {article.heading || article.title}
                          </h3>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 text-gray-500">
                      No matching news found.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "exhibition" && (
                <div className="text-center py-20 text-gray-500">
                  No matching exhibitions found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {activeVideoPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
            <button
              onClick={() => setActiveVideoPopup(null)}
              className="absolute top-4 right-4 z-[999] w-10 h-10 bg-black/50 hover:bg-[#da0e19] text-white rounded flex items-center justify-center transition-colors"
            >
              <FiX size={24} />
            </button>

            <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/90 to-transparent z-0 pointer-events-none">
              <h3 className="text-white font-bold text-lg drop-shadow-md">
                {activeVideoPopup.title}
              </h3>
            </div>

            <div className="w-full aspect-video bg-black relative z-10">
              {activeVideoPopup.isYouTube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoPopup.ytId}?autoplay=1&controls=1&rel=0`}
                  title={activeVideoPopup.title}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                  frameBorder="0"
                />
              ) : (
                <video
                  src={activeVideoPopup.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
