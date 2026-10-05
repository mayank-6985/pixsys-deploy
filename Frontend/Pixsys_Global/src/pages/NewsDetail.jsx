import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaHome, FaLinkedinIn, FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { TbGridDots } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useNews } from "../hooks/useNews";
import { useNewsDetail } from "../hooks/useNewsDetail";

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: article,
    isLoading: isArticleLoading,
    isError: isArticleError,
  } = useNewsDetail(id);

  const { data: newsList = [] } = useNews();

  const { prevArticleId, nextArticleId } = useMemo(() => {
    if (!Array.isArray(newsList) || newsList.length === 0) {
      return { prevArticleId: null, nextArticleId: null };
    }

    const sortedNews = [...newsList].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
    );

    const currentIndex = sortedNews.findIndex(
      (item) => String(item.news_id) === String(id),
    );

    return {
      prevArticleId:
        currentIndex < sortedNews.length - 1
          ? sortedNews[currentIndex + 1]?.news_id
          : null,
      nextArticleId:
        currentIndex > 0 ? sortedNews[currentIndex - 1]?.news_id : null,
    };
  }, [newsList, id]);

  if (isArticleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading article details...
      </div>
    );
  }

  if (isArticleError || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Article Not Found</h2>
        <p className="text-gray-500">
          The news article you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/news")}
          className="px-6 py-2 bg-[#da0f1a] text-white rounded mt-4 hover:bg-red-700 transition-colors"
        >
          Back to News
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-gray-800 transition-colors"
            >
              <FaHome className="text-[#da0f1a] text-lg" />
            </Link>
            <Link to="/news" className="hover:text-gray-800 transition-colors">
              News
            </Link>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-800 line-clamp-1">
              {article.heading}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate("/news")}
              className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#da0f1a] to-[#c9c9c9] text-white flex flex-col items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <TbGridDots className="text-3xl mb-1" />
              <span className="text-xs font-medium">Back</span>
            </button>
          </div>

          <div className="flex-1 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-normal text-gray-900 mb-6 leading-tight">
              {article.heading}
            </h1>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="text-gray-400 text-sm">
                {article.date?.replace(/-/g, ".")}
              </div>

              {/* <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-[#da0f1a] text-[#da0f1a] flex items-center justify-center hover:bg-[#da0f1a] hover:text-white transition-colors"
                >
                  <FaLinkedinIn size={14} />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-[#da0f1a] text-[#da0f1a] flex items-center justify-center hover:bg-[#da0f1a] hover:text-white transition-colors"
                >
                  <FaFacebookF size={14} />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-[#da0f1a] text-[#da0f1a] flex items-center justify-center hover:bg-[#da0f1a] hover:text-white transition-colors"
                >
                  <FaXTwitter size={14} />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full border border-[#da0f1a] text-[#da0f1a] flex items-center justify-center hover:bg-[#da0f1a] hover:text-white transition-colors"
                >
                  <FaInstagram size={14} />
                </a>
              </div> */}
            </div>

            {article.thumbnail && (
              <div className="w-full mb-10 rounded-sm overflow-hidden bg-gray-100">
                <img
                  src={article.thumbnail}
                  alt={article.heading}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div className="space-y-6 text-gray-700 leading-relaxed text-[15px]">
              {article.news_content?.map((block, index) => {
                if (block.type === "text") {
                  return <p key={index}>{block.description}</p>;
                }
                if (block.type === "image" && block.url) {
                  return (
                    <div key={index} className="my-8">
                      <img
                        src={block.url}
                        alt={block.caption || "Article media"}
                        className="w-full h-auto rounded-sm object-cover"
                      />
                      {block.caption && (
                        <p className="text-sm text-center text-gray-400 mt-2 italic">
                          {block.caption}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() =>
                  prevArticleId && navigate(`/news/${prevArticleId}`)
                }
                disabled={!prevArticleId}
                className={`flex items-center gap-2 px-6 py-2 rounded shadow-sm transition-colors ${
                  prevArticleId
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                <IoIosArrowBack />
                <span className="text-sm font-medium">Older</span>
              </button>

              <button
                onClick={() =>
                  nextArticleId && navigate(`/news/${nextArticleId}`)
                }
                disabled={!nextArticleId}
                className={`flex items-center gap-2 px-6 py-2 rounded shadow-sm transition-colors ${
                  nextArticleId
                    ? "bg-[#da0f1a] text-white hover:bg-red-700"
                    : "bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                <span className="text-sm font-medium">Newer</span>
                <IoIosArrowForward />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
