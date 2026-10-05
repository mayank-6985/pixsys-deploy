import React, { useState, useEffect, useMemo, useRef } from "react";
import { FaHome, FaPlay } from "react-icons/fa";
import { HiOutlineArrowRight } from "react-icons/hi";
import { FiX } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useSolutions } from "../hooks/useSolutions";
import ReactPlayer from "react-player";

const SolutionCard = ({ solution, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const isYouTube =
    solution?.videoUrl?.includes("youtube.com") ||
    solution?.videoUrl?.includes("youtu.be");

  const ytId = isYouTube
    ? solution.videoUrl.split("v=")[1]?.split("&")[0] ||
      solution.videoUrl.split("youtu.be/")[1]?.split("?")[0]
    : null;

  useEffect(() => {
    if (!isYouTube && videoRef.current) {
      if (isHovered) {
        videoRef.current
          .play()
          .catch((e) => console.log("Autoplay blocked", e));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, isYouTube]);

  return (
    <div
      className="group cursor-pointer flex flex-col"
      onClick={() => onClick(solution)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[220px] rounded-xl overflow-hidden shadow-lg mb-4 bg-black">
        {isHovered && isYouTube ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1`}
            className="w-full h-[300px] -mt-10 pointer-events-none object-cover"
            frameBorder="0"
            allow="autoplay; encrypted-media"
          ></iframe>
        ) : (
          <>
            {!isYouTube && (
              <video
                ref={videoRef}
                src={solution.videoUrl}
                muted
                loop
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            )}

            <div
              className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                isHovered ? "opacity-0" : "opacity-100"
              }`}
            >
              <img
                src={solution.thumbnail}
                alt={solution.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute top-4 left-4 text-white text-xs font-bold tracking-wider z-10">
                {solution.title}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/40 transition-colors">
                  <FaPlay className="text-white text-lg ml-1" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <h3 className="text-[1.05rem] font-bold leading-snug px-1 text-gray-800 group-hover:text-[#da0e19] transition-colors">
        {solution.title}
      </h3>
    </div>
  );
};

const Solutions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get("category") || "All";
  const [activeTab, setActiveTab] = useState(urlCategory);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const [data, setData] = useState([]);

  const {
    data: solutionsData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSolutions();

  const itemsPerPage = 6;

  useEffect(() => {
    setActiveTab(urlCategory);
    setCurrentPage(1);
  }, [urlCategory]);

  const filteredSolutions = useMemo(() => {
    if (!Array.isArray(solutionsData)) return [];
    if (activeTab === "All") {
      return solutionsData.flatMap((category) => category.solutions || []);
    }
    const selectedCategory = solutionsData.find(
      (cat) => cat.category_name === activeTab,
    );
    return selectedCategory?.solutions || [];
  }, [solutionsData, activeTab]);

  const derivedCategories = useMemo(() => {
    if (!Array.isArray(solutionsData)) return ["All"];
    const cats = solutionsData.map((cat) => cat.category_name).filter(Boolean);
    return ["All", ...cats];
  }, [solutionsData]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentSolutions = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredSolutions.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredSolutions, currentPage]);

  const handleTabChange = (category) => {
    setActiveTab(category);
    setCurrentPage(1);
    setSearchParams({ category: category });
  };

  const closeModal = () => {
    setIsVideoReady(false);
    setSelectedVideo(null);
  };

  const totalPages = Math.ceil(filteredSolutions.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading solutions...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          Failed to load solutions: {error?.message}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#da0e19] text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <section className="relative w-full h-[300px] md:h-[400px] bg-gray-900 overflow-hidden">
        {/* <img
          src="https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80"
          alt="Keyboard"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        /> */}
        <div className="absolute top-1/2 left-10 md:left-24 -translate-y-1/2 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide">
            Solutions
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-6 mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to={"/u"}>
            <FaHome className="text-[#da0e19] text-lg cursor-pointer" />
          </Link>
          <span className="cursor-pointer hover:text-[#da0e19]">Solutions</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-center gap-8 border-b border-gray-200 overflow-x-auto whitespace-nowrap pb-0">
          {derivedCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleTabChange(category)}
              className={`pb-4 text-sm font-medium transition-colors duration-500 relative ${
                activeTab === category
                  ? "text-[#da0e19]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {category}
              <div
                className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#da0e19] transition-transform duration-500 ease-in-out origin-center ${
                  activeTab === category ? "scale-x-100" : "scale-x-0"
                }`}
              ></div>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10 min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#da0e19]"></div>
          </div>
        ) : currentSolutions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {currentSolutions.map((solution) => (
              <SolutionCard
                key={solution.solutions_id}
                solution={solution}
                onClick={setSelectedVideo}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No solutions found for this category.
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 pb-20">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`w-8 h-8 flex items-center justify-center transition-colors ${
                currentPage === index + 1
                  ? "border-b-2 border-[#da0e19] text-[#da0e19] font-medium"
                  : "text-gray-400 hover:text-gray-800"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`w-8 h-8 flex items-center justify-center transition-colors ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-[#da0e19] hover:text-[#da0e19]"
            }`}
          >
            <HiOutlineArrowRight className="text-xl" />
          </button>
        </div>
      )}

      {/* VIDEO MODAL  */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={closeModal}
          ></div>

          <div className="relative w-full max-w-5xl bg-black rounded-lg shadow-2xl overflow-hidden z-10">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 text-white hover:text-[#da0e19] bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
            >
              <FiX className="text-2xl" />
            </button>

            {selectedVideo?.videoUrl?.includes("youtube.com") ||
            selectedVideo?.videoUrl?.includes("youtu.be") ? (
              <iframe
                width="100%"
                height="600"
                src={`https://www.youtube.com/embed/${selectedVideo?.videoUrl?.split("v=")[1]?.split("&")[0] || selectedVideo?.videoUrl?.split("youtu.be/")[1]?.split("?")[0]}`}
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ backgroundColor: "#000" }}
              ></iframe>
            ) : (
              <video
                key={selectedVideo?.solutions_id}
                controls
                autoPlay
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "600px",
                  backgroundColor: "#000",
                }}
                onError={(e) => console.error("Video Error:", e)}
              >
                <source src={selectedVideo?.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Solutions;
