import React, { useState, useMemo } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import {
  useAdminSolutionsData,
  useCategoryMutations,
  useSolutionMutations,
} from "../hooks/useSolutions";
import FileUploader from "../Components/FileUploader";

const MessageBanner = ({ type, text, onClose }) => {
  if (!text) return null;
  const isError = type === "error";
  return (
    <div
      className={`mb-4 p-4 text-sm font-medium flex justify-between items-center rounded-md ${
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

const emptyCategory = { category_name: "", thumbnail: "" };
const emptySolution = {
  category_id: "",
  title: "",
  thumbnail: "",
  videoUrl: "",
};

const Solutions = () => {
  const [activeTab, setActiveTab] = useState("categories");
  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);

  const [catFormData, setCatFormData] = useState(emptyCategory);
  const [solFormData, setSolFormData] = useState(emptySolution);

  // Custom Modal & Notification States
  const [deleteConfirm, setDeleteConfirm] = useState({ id: null, type: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageMessage, setPageMessage] = useState({ type: "", text: "" });

  const { data: rawData = [], isLoading } = useAdminSolutionsData();
  const { createCat, updateCat, deleteCat } = useCategoryMutations();
  const { createSol, updateSol, deleteSol } = useSolutionMutations();

  const categoriesList = useMemo(() => {
    if (!Array.isArray(rawData)) return [];
    return rawData.map((cat) => ({
      category_id: cat.category_id,
      category_name: cat.category_name,
      thumbnail: cat.thumbnail,
      solutionCount: cat.solutions?.length || 0,
    }));
  }, [rawData]);

  const solutionsList = useMemo(() => {
    if (!Array.isArray(rawData)) return [];
    return rawData.flatMap((cat) =>
      (cat.solutions || []).map((sol) => ({
        ...sol,
        category_name: cat.category_name,
        category_id: cat.category_id,
      })),
    );
  }, [rawData]);

  const handleOpenCreate = () => {
    setPageMessage({ type: "", text: "" });
    setEditingId(null);
    if (activeTab === "categories") {
      setCatFormData(emptyCategory);
      createCat.reset();
      updateCat.reset();
    } else {
      setSolFormData(emptySolution);
      createSol.reset();
      updateSol.reset();
    }
    setView("form");
  };

  const handleOpenEditCat = (cat) => {
    setPageMessage({ type: "", text: "" });
    setEditingId(cat.category_id);
    setCatFormData({
      category_name: cat.category_name,
      thumbnail: cat.thumbnail,
    });
    updateCat.reset();
    setView("form");
  };

  const handleOpenEditSol = (sol) => {
    setPageMessage({ type: "", text: "" });
    setEditingId(sol.solutions_id);
    setSolFormData({
      category_id: sol.category_id,
      title: sol.title,
      thumbnail: sol.thumbnail,
      videoUrl: sol.videoUrl,
    });
    updateSol.reset();
    setView("form");
  };

  const initiateDeleteCat = (id) => {
    setPageMessage({ type: "", text: "" });
    setDeleteConfirm({ id, type: "category" });
  };

  const initiateDeleteSol = (id) => {
    setPageMessage({ type: "", text: "" });
    setDeleteConfirm({ id, type: "solution" });
  };

  const confirmDelete = () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(true);

    const { id, type } = deleteConfirm;

    if (type === "category") {
      deleteCat.mutate(id, {
        onSuccess: () => {
          setPageMessage({
            type: "success",
            text: "Category deleted successfully.",
          });
          setDeleteConfirm({ id: null, type: null });
          setIsDeleting(false);
        },
        onError: () => {
          setPageMessage({
            type: "error",
            text: "Something went wrong while trying to delete this category. Please try again.",
          });
          setDeleteConfirm({ id: null, type: null });
          setIsDeleting(false);
        },
      });
    } else {
      deleteSol.mutate(id, {
        onSuccess: () => {
          setPageMessage({
            type: "success",
            text: "Solution deleted successfully.",
          });
          setDeleteConfirm({ id: null, type: null });
          setIsDeleting(false);
        },
        onError: () => {
          setPageMessage({
            type: "error",
            text: "Something went wrong while trying to delete this solution. Please try again.",
          });
          setDeleteConfirm({ id: null, type: null });
          setIsDeleting(false);
        },
      });
    }
  };

  const handleCatChange = (e) => {
    setCatFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSolChange = (e) => {
    const value =
      e.target.name === "category_id"
        ? parseInt(e.target.value)
        : e.target.value;
    setSolFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleCatSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateCat.mutate(
        { category_id: editingId, ...catFormData },
        { onSuccess: () => setView("list") },
      );
    } else {
      createCat.mutate(catFormData, { onSuccess: () => setView("list") });
    }
  };

  const handleSolSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateSol.mutate(
        { solutions_id: editingId, ...solFormData },
        { onSuccess: () => setView("list") },
      );
    } else {
      createSol.mutate(solFormData, { onSuccess: () => setView("list") });
    }
  };

  const isCatSaving = createCat.isPending || updateCat.isPending;
  const catError = createCat.isError || updateCat.isError;

  const isSolSaving = createSol.isPending || updateSol.isPending;
  const solError = createSol.isError || updateSol.isError;

  if (view === "form") {
    return (
      <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8 w-full font-sans">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-6 sm:px-8 py-5 flex justify-between items-center border-b border-zinc-100 bg-zinc-900 text-white">
            <h1 className="text-lg font-bold uppercase tracking-widest">
              {editingId
                ? `Edit ${activeTab === "categories" ? "Category" : "Solution"}`
                : `Create ${activeTab === "categories" ? "Category" : "Solution"}`}
            </h1>
            <button
              onClick={() => setView("list")}
              className="p-2 text-zinc-400 hover:text-white rounded-md transition-colors"
            >
              <FiX size={22} />
            </button>
          </div>

          {activeTab === "categories" ? (
            <form onSubmit={handleCatSubmit} className="p-6 sm:p-8">
              {catError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#da0e19] text-[#da0e19] text-sm font-medium rounded-r-md">
                  Something went wrong while processing your request. Please try
                  again.
                </div>
              )}

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="category_name"
                    required
                    value={catFormData.category_name}
                    onChange={handleCatChange}
                    disabled={isCatSaving}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-md focus:ring-1 focus:ring-[#da0e19] focus:border-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <FileUploader
                    label="Category Thumbnail *"
                    accept="image/*"
                    folder="solutions/categories"
                    currentFileUrl={catFormData.thumbnail}
                    onUploadSuccess={(url) =>
                      setCatFormData((prev) => ({ ...prev, thumbnail: url }))
                    }
                  />
                  <input
                    type="hidden"
                    name="thumbnail"
                    required
                    value={catFormData.thumbnail || ""}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-zinc-200 gap-4">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  disabled={isCatSaving}
                  className="px-6 py-3 border border-zinc-300 text-zinc-700 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCatSaving}
                  className="flex items-center justify-center min-w-[160px] gap-2 px-8 py-3 bg-[#da0e19] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isCatSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FiSave size={16} />
                  )}
                  {isCatSaving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Category"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSolSubmit} className="p-6 sm:p-8">
              {solError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#da0e19] text-[#da0e19] text-sm font-medium rounded-r-md">
                  Something went wrong while processing your request. Please try
                  again.
                </div>
              )}

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                    Assign to Category *
                  </label>
                  <select
                    name="category_id"
                    required
                    value={solFormData.category_id}
                    onChange={handleSolChange}
                    disabled={isSolSaving}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-md focus:ring-1 focus:ring-[#da0e19] focus:border-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-60"
                  >
                    <option value="" disabled>
                      Select a Category...
                    </option>
                    {categoriesList.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                    Solution Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    maxLength={100}
                    value={solFormData.title}
                    onChange={handleSolChange}
                    disabled={isSolSaving}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-md focus:ring-1 focus:ring-[#da0e19] focus:border-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <FileUploader
                    label="Solution Thumbnail *"
                    accept="image/*"
                    folder="solutions/thumbnails"
                    currentFileUrl={solFormData.thumbnail}
                    onUploadSuccess={(url) =>
                      setSolFormData((prev) => ({ ...prev, thumbnail: url }))
                    }
                  />
                  <input
                    type="hidden"
                    name="thumbnail"
                    required
                    value={solFormData.thumbnail || ""}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                    Video URL *
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    required
                    value={solFormData.videoUrl}
                    onChange={handleSolChange}
                    disabled={isSolSaving}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-md focus:ring-1 focus:ring-[#da0e19] focus:border-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-zinc-200 gap-4">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  disabled={isSolSaving}
                  className="px-6 py-3 border border-zinc-300 text-zinc-700 font-bold uppercase tracking-widest text-xs rounded-md hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSolSaving}
                  className="flex items-center justify-center min-w-[160px] gap-2 px-8 py-3 bg-[#da0e19] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSolSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <FiSave size={16} />
                  )}
                  {isSolSaving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Solution"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8 w-full font-sans flex flex-col gap-6 relative">
      {/* CUSTOM DELETE MODAL */}
      {deleteConfirm.id !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity">
          <div className="bg-white w-full max-w-md shadow-xl flex flex-col">
            <div className="bg-[#1a1a1a] px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold tracking-widest uppercase text-sm">
                Confirm Delete
              </h3>
              <button
                onClick={() => setDeleteConfirm({ id: null, type: null })}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-8 text-center bg-white">
              <p className="text-zinc-700 text-sm font-medium">
                {deleteConfirm.type === "category"
                  ? "Are you sure you want to delete this category AND all its solutions?"
                  : "Are you sure you want to delete this solution?"}
              </p>
            </div>

            <div className="px-6 py-4 flex justify-center gap-4 bg-white border-t border-zinc-100">
              <button
                onClick={() => setDeleteConfirm({ id: null, type: null })}
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

      <div className="bg-white border border-zinc-200 shadow-sm p-6 flex flex-col gap-6">
        <div className="px-2 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-6">
          <div className="flex bg-zinc-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-6 py-2 rounded-md text-xs tracking-widest uppercase font-bold transition-all ${
                activeTab === "categories"
                  ? "bg-white text-[#da0e19] shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("solutions")}
              className={`px-6 py-2 rounded-md text-xs tracking-widest uppercase font-bold transition-all ${
                activeTab === "solutions"
                  ? "bg-white text-[#da0e19] shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              Solutions
            </button>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex justify-center items-center gap-2 px-5 py-2.5 bg-[#da0e19] hover:bg-red-700 text-white rounded-md text-xs font-bold uppercase tracking-widest transition-colors w-full sm:w-auto shadow-sm"
          >
            <FiPlus size={16} /> Add New{" "}
            {activeTab === "categories" ? "Category" : "Solution"}
          </button>
        </div>

        {/* MESSAGE BANNER INTEGRATION */}
        <MessageBanner
          type={pageMessage.type}
          text={pageMessage.text}
          onClose={() => setPageMessage({ type: "", text: "" })}
        />

        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="py-20 flex flex-col justify-center items-center text-gray-400">
              <Loader2 className="animate-spin w-8 h-8 mb-4" />
              <span className="text-sm font-medium">Loading Records...</span>
            </div>
          ) : activeTab === "categories" ? (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs font-bold tracking-widest uppercase">
                  <th className="py-4 px-6 w-24">Sr.</th>
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6 w-32 text-center">Solutions</th>
                  <th className="py-4 px-6 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoriesList.map((item, index) => (
                  <tr
                    key={item.category_id}
                    className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors group"
                  >
                    <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 text-zinc-900 font-bold">
                      {item.category_name}
                    </td>
                    <td className="py-4 px-6 text-zinc-500 text-sm text-center">
                      {item.solutionCount}
                    </td>
                    <td className="py-4 px-6 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditCat(item)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => initiateDeleteCat(item.category_id)}
                        disabled={isDeleting || deleteCat.isPending}
                        className="p-2 text-zinc-400 hover:text-[#da0e19] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {categoriesList.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs"
                    >
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs font-bold tracking-widest uppercase">
                  <th className="py-4 px-6 w-24">ID</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {solutionsList.map((item) => (
                  <tr
                    key={item.solutions_id}
                    className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors group"
                  >
                    <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                      #{String(item.solutions_id).padStart(4, "0")}
                    </td>
                    <td className="py-4 px-6 text-zinc-500 text-xs font-bold uppercase">
                      <span className="px-2 py-1 bg-zinc-100 border border-zinc-200 rounded">
                        {item.category_name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-900 font-bold">
                      {item.title}
                    </td>
                    <td className="py-4 px-6 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditSol(item)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => initiateDeleteSol(item.solutions_id)}
                        disabled={isDeleting || deleteSol.isPending}
                        className="p-2 text-zinc-400 hover:text-[#da0e19] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {solutionsList.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs"
                    >
                      No solutions found.
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
};

export default Solutions;
