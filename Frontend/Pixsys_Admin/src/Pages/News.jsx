import React, { useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiImage,
  FiType,
} from "react-icons/fi";
import { Loader2, X } from "lucide-react";
import { useAdminNews, useNewsMutations } from "../hooks/useNews";
import { fetchNewsById } from "../Services/news";
import FileUploader from "../Components/FileUploader";

const MessageBanner = ({ type, text, onClose }) => {
  if (!text) return null;
  const isError = type === "error";
  return (
    <div
      className={`mb-4 p-4 text-sm font-medium flex justify-between items-center ${
        isError
          ? "bg-red-50 border-l-4 border-[#da0e19] text-[#da0e19]"
          : "bg-green-50 border-l-4 border-green-600 text-green-700"
      }`}
    >
      <span>{text}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="opacity-70 hover:opacity-100 text-lg leading-none"
        >
          &times;
        </button>
      )}
    </div>
  );
};

const initialFormState = {
  date: new Date().toISOString().split("T")[0],
  heading: "",
  thumbnail: "",
  content: [{ type: "text", description: "", url: "", caption: "" }],
};

const News = () => {
  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const { data: newsList = [], isLoading: isListLoading } = useAdminNews();
  const { createMutation, updateMutation, deleteMutation } = useNewsMutations();

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageMessage, setPageMessage] = useState({ type: "", text: "" });

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const hasError = createMutation.isError || updateMutation.isError;

  const resetMutations = () => {
    createMutation.reset();
    updateMutation.reset();
  };

  const handleOpenCreate = () => {
    resetMutations();
    setFormData(initialFormState);
    setEditingId(null);
    setView("form");
  };

  const handleOpenEdit = async (id) => {
    resetMutations();
    setIsFetchingDetail(true);
    setPageMessage({ type: "", text: "" });
    setView("form");
    setEditingId(id);
    try {
      const fullData = await fetchNewsById(id);
      setFormData({
        news_id: fullData.news_id,
        date: fullData.date,
        heading: fullData.heading,
        thumbnail: fullData.thumbnail,
        content: fullData.news_content?.length
          ? fullData.news_content
          : initialFormState.content,
      });
    } catch (error) {
      setPageMessage({
        type: "error",
        text: "Something went wrong while fetching news details. Please try again.",
      });
      setView("list");
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const initiateDelete = (id) => {
    setPageMessage({ type: "", text: "" });
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);

    deleteMutation.mutate(deleteConfirmId, {
      onSuccess: () => {
        setPageMessage({
          type: "success",
          text: "News article deleted successfully.",
        });
        setDeleteConfirmId(null);
        setIsDeleting(false);
      },
      onError: () => {
        setPageMessage({
          type: "error",
          text: "Something went wrong while trying to delete this item. Please try again.",
        });
        setDeleteConfirmId(null);
        setIsDeleting(false);
      },
    });
  };

  const handleBasicChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContentChange = (index, field, value) => {
    setFormData((prev) => {
      const newContent = prev.content.map((block, i) => {
        if (i !== index) return block;

        const updatedBlock = { ...block, [field]: value };
        if (field === "type") {
          if (value === "text") {
            updatedBlock.url = "";
            updatedBlock.caption = "";
          } else if (value === "image") {
            updatedBlock.description = "";
          }
        }
        return updatedBlock;
      });

      return { ...prev, content: newContent };
    });
  };

  const addContentBlock = () => {
    setFormData((prev) => ({
      ...prev,
      content: [
        ...prev.content,
        { type: "text", description: "", url: "", caption: "" },
      ],
    }));
  };

  const removeContentBlock = (index) => {
    if (formData.content.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedContent = formData.content.map((block) => {
      if (block.type === "text") {
        return {
          type: "text",
          description: block.description || "",
        };
      } else {
        return {
          type: "image",
          url: block.url || "",
          caption: block.caption || "",
        };
      }
    });

    const payload = { ...formData, content: cleanedContent };

    if (editingId) {
      updateMutation.mutate(payload, { onSuccess: () => setView("list") });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setView("list") });
    }
  };

  if (view === "list") {
    return (
      <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8 w-full font-sans flex flex-col gap-6 relative">
        {/* CUSTOM DELETE MODAL */}
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity">
            <div className="bg-white w-full max-w-md shadow-xl flex flex-col">
              <div className="bg-[#1a1a1a] px-6 py-4 flex justify-between items-center">
                <h3 className="text-white font-bold tracking-widest uppercase text-sm">
                  Confirm Delete
                </h3>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-8 text-center bg-white">
                <p className="text-zinc-700 text-sm font-medium">
                  Are you sure you want to delete this news article?
                </p>
              </div>

              <div className="px-6 py-4 flex justify-center gap-4 bg-white border-t border-zinc-100">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-6 py-2.5 border border-zinc-300 text-zinc-700 font-bold uppercase tracking-widest text-xs hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#da0e19] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-70"
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FiTrash2 size={14} />
                  )}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center border-b border-zinc-200 bg-zinc-900 text-white">
            <h1 className="text-sm font-bold uppercase tracking-widest">
              News Inventory
            </h1>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#da0e19] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <FiPlus size={16} /> Add New News
            </button>
          </div>

          {/* MESSAGE BANNER INTEGRATION */}
          <div className="px-6 pt-4">
            <MessageBanner
              type={pageMessage.type}
              text={pageMessage.text}
              onClose={() => setPageMessage({ type: "", text: "" })}
            />
          </div>

          <div className="overflow-x-auto w-full">
            {isListLoading ? (
              <div className="py-20 flex flex-col justify-center items-center text-gray-400">
                <Loader2 className="animate-spin w-8 h-8 mb-4" />
                <span className="text-sm font-medium">Loading News...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs font-bold tracking-widest uppercase">
                    <th className="py-4 px-6 w-24">Sr.</th>
                    <th className="py-4 px-6 w-32">Date</th>
                    <th className="py-4 px-6">Heading</th>
                    <th className="py-4 px-6 text-right w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newsList.map((item, index) => (
                    <tr
                      key={item.news_id}
                      className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors group"
                    >
                      <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 text-zinc-500 text-sm whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-4 px-6 text-zinc-900 font-bold">
                        {item.heading}
                      </td>
                      <td className="py-4 px-6 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(item.news_id)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => initiateDelete(item.news_id)}
                          disabled={isDeleting || deleteMutation.isPending}
                          className="p-2 text-zinc-400 hover:text-[#da0e19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {newsList.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs"
                      >
                        No news articles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8 w-full font-sans">
      <div className="max-w-4xl mx-auto bg-white border border-zinc-200 shadow-xl overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-200 bg-zinc-900 text-white">
          <h1 className="text-lg font-bold uppercase tracking-widest">
            {editingId ? "Edit News Article" : "Create Fresh News"}
          </h1>
          <button
            onClick={() => setView("list")}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {isFetchingDetail ? (
          <div className="py-20 flex flex-col justify-center items-center text-gray-400">
            <Loader2 className="animate-spin w-8 h-8 mb-4" />
            <span className="text-sm font-medium">Loading News</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 bg-white">
            {hasError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#da0e19] text-[#da0e19] text-sm font-medium rounded-r-md">
                Something went wrong while processing your request. Please try
                again.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                  Heading *
                </label>
                <input
                  type="text"
                  name="heading"
                  required
                  maxLength={255}
                  value={formData.heading}
                  onChange={handleBasicChange}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                  placeholder="Enter article title"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleBasicChange}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                />
              </div>
              <div>
                <FileUploader
                  label="News Thumbnail *"
                  accept="image/jpeg, image/png, image/webp"
                  folder="news/thumbnails"
                  currentFileUrl={formData.thumbnail}
                  onUploadSuccess={(url) =>
                    setFormData((prev) => ({ ...prev, thumbnail: url }))
                  }
                />
                <input
                  type="hidden"
                  required
                  value={formData.thumbnail || ""}
                />
              </div>
            </div>

            <div className="mb-10 pt-6 border-t border-zinc-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="block text-xs font-bold text-zinc-900 uppercase tracking-widest">
                  Article Content
                </h2>
              </div>

              <div className="space-y-6">
                {formData.content.map((block, index) => (
                  <div
                    key={index}
                    className="p-6 border border-zinc-200 rounded-sm bg-zinc-50 relative"
                  >
                    {formData.content.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContentBlock(index)}
                        disabled={isSaving}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-[#da0e19] transition-colors disabled:opacity-50"
                        title="Remove Block"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                      <div className="lg:col-span-1">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                          Block Type
                        </label>
                        <select
                          value={block.type}
                          onChange={(e) =>
                            handleContentChange(index, "type", e.target.value)
                          }
                          disabled={isSaving}
                          className="w-full px-3 py-2.5 border border-zinc-300 focus:border-[#da0e19] outline-none bg-white transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-60"
                        >
                          <option value="text">Paragraph Text</option>
                          <option value="image">Media Image</option>
                        </select>
                      </div>
                      <div className="lg:col-span-3 pt-1">
                        {block.type === "text" ? (
                          <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
                              <FiType size={14} /> Description
                            </label>
                            <textarea
                              required
                              value={block.description}
                              onChange={(e) =>
                                handleContentChange(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              disabled={isSaving}
                              rows="4"
                              className="w-full px-4 py-3 bg-white border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none resize-y transition-all text-sm disabled:opacity-60"
                              placeholder="Write your paragraph here..."
                            ></textarea>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <FileUploader
                                label="Block Image *"
                                accept="image/jpeg, image/png, image/webp"
                                folder="news/content"
                                currentFileUrl={block.url}
                                onUploadSuccess={(url) =>
                                  handleContentChange(index, "url", url)
                                }
                              />
                              <input
                                type="hidden"
                                required
                                value={block.url || ""}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
                                Caption
                              </label>
                              <input
                                type="text"
                                required
                                maxLength={100}
                                value={block.caption}
                                onChange={(e) =>
                                  handleContentChange(
                                    index,
                                    "caption",
                                    e.target.value,
                                  )
                                }
                                disabled={isSaving}
                                className="w-full px-4 py-3 bg-white border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                                placeholder="Enter image caption"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addContentBlock}
                disabled={isSaving}
                className="mt-6 flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 text-xs font-bold text-[#da0e19] uppercase tracking-widest bg-red-50 hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-50"
              >
                <FiPlus size={16} /> Add Content Block
              </button>
            </div>

            <div className="flex justify-end pt-6 border-t border-zinc-200 gap-4">
              <button
                type="button"
                onClick={() => setView("list")}
                disabled={isSaving}
                className="px-6 py-3 border border-zinc-300 text-zinc-700 font-bold uppercase tracking-widest text-xs hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center min-w-[160px] gap-2 px-8 py-3 bg-[#da0e19] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FiSave size={16} />
                )}
                {isSaving
                  ? editingId
                    ? "Updating..."
                    : "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Publish News"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default News;
