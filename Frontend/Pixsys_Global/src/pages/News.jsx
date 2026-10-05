import React, { useState, useMemo, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { HiOutlineArrowRight } from "react-icons/hi";
import { newsData } from "../data/newsPageData";
import { Link } from "react-router-dom";
import { useNews } from "../hooks/useNews";

const tabs = ["News", "Events", "Newsletter"];

const News = () => {
  const [activeTab, setActiveTab] = useState("News");
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: newsData = [], isLoading, isError, error, refetch } = useNews();

  const availableYears = useMemo(() => {
    const years = newsData
      .map((item) => item.date?.split("-")[0])
      .filter(Boolean);
    const uniqueSortedYears = [...new Set(years)].sort((a, b) => b - a);
    return ["All", ...uniqueSortedYears];
  }, [newsData]);

  const filteredNews = useMemo(() => {
    if (!Array.isArray(newsData)) return [];

    return newsData.filter((article) => {
      const matchYear =
        selectedYear === "All" ||
        (article.date && article.date.startsWith(selectedYear));

      const matchSearch =
        !searchQuery ||
        (article.heading &&
          article.heading.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchYear && matchSearch;
    });
  }, [newsData, selectedYear, searchQuery]);

  const isDefaultView =
    selectedYear === "All" &&
    searchQuery === "" &&
    currentPage === 1 &&
    activeTab === "News";
  const sortedNews = [...filteredNews].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
  );

  const featuredArticles = sortedNews.slice(0, 5);
  const gridArticles = sortedNews;
  const totalPages = Math.ceil(gridArticles.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGridItems = gridArticles.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handleFilterChange = () => setCurrentPage(1);

  useEffect(() => {
    if (featuredArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === featuredArticles.length - 1 ? 0 : prev + 1,
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading latest news...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">Failed to load news: {error?.message}</p>
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      <section className="relative w-full h-[400px] bg-gray-900 flex flex-col justify-between pt-24">
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full mt-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white">News</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-6 mb-8 relative z-20">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FaHome className="text-[#da0e19] text-lg cursor-pointer" />
          <span className="cursor-pointer hover:text-[#da0e19]">News</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <div className="relative w-full rounded-lg overflow-hidden bg-[#f8f9fa] shadow-sm border border-gray-100">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredArticles.map((article) => (
                  <Link
                    to={`/news/${article.news_id}`}
                    key={article.news_id}
                    className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-5 min-h-[350px] lg:h-[450px]"
                  >
                    <div className="w-full h-[250px] lg:h-full overflow-hidden lg:col-span-3">
                      <img
                        src={article.thumbnail}
                        alt={article.heading}
                        className="w-full h-full object-fit"
                      />
                    </div>

                    <div className="p-8 md:p-12 flex flex-col justify-center overflow-hidden lg:col-span-2">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 shrink-0">
                        <span className="w-8 h-[1px] bg-gray-300"></span>
                        {article.date.replace(/-/g, ".")}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 line-clamp-2 shrink-0">
                        {article.heading}
                      </h2>

                      <div className="shrink-0 mt-auto lg:mt-0">
                        <button className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#da0e19] text-[#da0e19] rounded-full hover:bg-red-50 transition-colors font-medium text-sm group">
                          Learn More
                          <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex justify-center items-center gap-3 mt-6">
              {featuredArticles.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx
                      ? "bg-[#da0e19] w-4"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-10">
          <div className="relative w-full sm:w-48">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                handleFilterChange();
              }}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded focus:outline-none focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] cursor-pointer text-sm"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year === "All" ? "All Years" : year}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search Keywords"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleFilterChange();
              }}
              className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded focus:outline-none focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] text-sm"
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {currentGridItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-16">
            {currentGridItems.map((article) => (
              <Link
                to={`/news/${article.news_id}`}
                key={article.news_id}
                className="group cursor-pointer flex flex-col"
              >
                <div className="w-full h-[220px] rounded overflow-hidden bg-gray-200 mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                  <img
                    src={article.thumbnail}
                    alt={article.heading}
                    className="w-full h-full object-fit group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                  <span className="w-6 h-[1px] bg-gray-300"></span>
                  {article.date.replace(/-/g, ".")}
                </div>
                <h3 className="text-[1.05rem] font-bold leading-snug text-gray-800 group-hover:text-[#da0e19] transition-colors">
                  {article.heading}
                </h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No news articles found matching your criteria.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pb-20">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`relative w-8 h-8 flex items-center justify-center transition-colors duration-500 ${
                  currentPage === index + 1
                    ? "text-[#da0e19] font-medium"
                    : "text-gray-400 hover:text-gray-800"
                }`}
              >
                {index + 1}
                <div
                  className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#da0e19] transition-transform duration-500 ease-in-out origin-center ${
                    currentPage === index + 1 ? "scale-x-100" : "scale-x-0"
                  }`}
                />
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
                  : "text-[#da0e19] "
              }`}
            >
              <HiOutlineArrowRight className="text-xl" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
