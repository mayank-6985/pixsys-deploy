import React, { useEffect, useState, useMemo } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from "react-icons/fi";
import { AiFillProduct } from "react-icons/ai";
import { Loader2 } from "lucide-react";
import {
  useAdminProductsData,
  useCategoryMutations,
  useSubcategoryMutations,
  useTagMutations,
  useProductMutations,
  useCategoryDetails,
  useProductDetail,
} from "../hooks/useProducts";
import FileUploader from "../Components/FileUploader";

const emptyCategory = {
  category_name: "",
  tagline: "",
  category_img: "",
};
const emptySubcategory = {
  category_id: "",
  name: "",
  description: "",
  category_img: "",
};
const emptyTag = {
  subcategory_id: "",
  name: "",
};

const Products = () => {
  const [selCat, setSelCat] = useState("");
  const [selSub, setSelSub] = useState("");
  const [selTag, setSelTag] = useState("");
  const [view, setView] = useState("list");
  const [formType, setFormType] = useState("categories");
  const [editingId, setEditingId] = useState(null);
  const [productEditId, setProductEditId] = useState(null);

  const [formData, setFormData] = useState({});

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    type: "",
  });
  const [actionError, setActionError] = useState("");

  const { data: rawData = [], isLoading } = useAdminProductsData();
  const { data: productDetail, isLoading: isProductDetailLoading } =
    useProductDetail(productEditId);

  const { data: detailedCategoryData = [], isLoading: isDetailsLoading } =
    useCategoryDetails(selCat);

  const { createCat, updateCat, deleteCat } = useCategoryMutations();
  const { createSubCat, updateSubCat, deleteSubCat } =
    useSubcategoryMutations();
  const { createTag, updateTag, deleteTag } = useTagMutations();
  const { createProd, updateProd, deleteProd } = useProductMutations();

  const isSaving =
    createCat.isPending ||
    updateCat.isPending ||
    createSubCat.isPending ||
    updateSubCat.isPending ||
    createTag.isPending ||
    updateTag.isPending ||
    createProd.isPending ||
    updateProd.isPending;

  const isDeleting =
    deleteCat.isPending ||
    deleteSubCat.isPending ||
    deleteTag.isPending ||
    deleteProd.isPending;

  const hasError =
    createCat.isError ||
    updateCat.isError ||
    createSubCat.isError ||
    updateSubCat.isError ||
    createTag.isError ||
    updateTag.isError ||
    createProd.isError ||
    updateProd.isError;

  const resetAllMutations = () => {
    createCat.reset();
    updateCat.reset();
    createSubCat.reset();
    updateSubCat.reset();
    createTag.reset();
    updateTag.reset();
    createProd.reset();
    updateProd.reset();
  };

  const categories = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData?.data && Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, [rawData]);

  const subcategories = useMemo(() => {
    if (!selCat || !detailedCategoryData) return [];
    if (Array.isArray(detailedCategoryData)) return detailedCategoryData;
    if (detailedCategoryData?.data) return detailedCategoryData.data;
    if (detailedCategoryData?.subcategories)
      return detailedCategoryData.subcategories;
    return [];
  }, [detailedCategoryData, selCat]);

  const currentSubcategory = useMemo(() => {
    if (!selSub) return null;
    return (
      subcategories.find((s) => String(s.subcategory_id) === String(selSub)) ||
      null
    );
  }, [subcategories, selSub]);

  const tags = useMemo(() => {
    return currentSubcategory?.tags || [];
  }, [currentSubcategory]);

  const currentTag = useMemo(() => {
    if (!selTag) return null;
    return tags.find((t) => String(t.tag_id) === String(selTag)) || null;
  }, [tags, selTag]);

  const products = useMemo(() => {
    return currentTag?.products || [];
  }, [currentTag]);

  const activeLevel = useMemo(() => {
    if (selTag) return "products";
    if (selSub) return "tags";
    if (selCat) return "subcategories";
    return "categories";
  }, [selCat, selSub, selTag]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setProductEditId(null);
    setFormType(activeLevel);
    resetAllMutations();
    setActionError("");

    if (activeLevel === "categories") {
      setFormData({ ...emptyCategory });
    } else if (activeLevel === "subcategories") {
      setFormData({ ...emptySubcategory, category_id: selCat });
    } else if (activeLevel === "tags") {
      setFormData({ ...emptyTag, subcategory_id: selSub });
    } else if (activeLevel === "products") {
      setFormData({
        tag_id: selTag,
        name: "",
        tagline: "",
        description: "",
        product_img: "",
        specifications: [""],
      });
    }
    setView("form");
  };

  const handleOpenEdit = (item, type) => {
    setFormType(type);
    resetAllMutations();
    setActionError("");

    if (type === "categories") {
      setEditingId(item.category_id);
      setFormData({
        category_name: item.category_name || "",
        tagline: item.tagline || item.original?.tagline || "",
        category_img: item.category_img || item.original?.category_img || "",
      });
    } else if (type === "subcategories") {
      setEditingId(item.subcategory_id);
      setFormData({
        category_id: item.category_id || selCat || "",
        name: item.name || "",
        description: item.description || item.original?.description || "",
        category_img: item.category_img || item.original?.category_img || "",
      });
    } else if (type === "tags") {
      setEditingId(item.tag_id);
      setFormData({
        subcategory_id: item.subcategory_id || selSub || "",
        name: item.name || "",
      });
    } else if (type === "products") {
      setEditingId(item.product_id);
      setProductEditId(item.product_id);

      const existingSpecs =
        Array.isArray(item.specifications) && item.specifications.length
          ? item.specifications.map((s) =>
              typeof s === "string"
                ? s
                : s?.image || s?.image_url || s?.url || s?.file || "",
            )
          : [""];

      setFormData({
        tag_id: item.tag_id || selTag || "",
        name: item.name || "",
        tagline: item.tagline || item.original?.tagline || "",
        description: item.description || item.original?.description || "",
        product_img:
          item.product_img ||
          item.product_image ||
          item.image ||
          item.original?.product_img ||
          "",
        specifications: existingSpecs,
      });
    }
    setView("form");
  };

  const handleDeleteClick = (id, type) => {
    setActionError("");
    setDeleteModal({ isOpen: true, id, type });
  };

  const executeDelete = () => {
    const { id, type } = deleteModal;

    const getErrorMsg = (err, itemType, childType) => {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;
      if (
        backendMsg &&
        typeof backendMsg === "string" &&
        backendMsg.length < 100
      ) {
        return backendMsg;
      }
      return `Cannot delete this ${itemType}. Please delete all associated ${childType} inside it first.`;
    };

    const handleSuccess = () => {
      setDeleteModal({ isOpen: false, id: null, type: "" });
      if (type === "categories" && String(selCat) === String(id)) {
        setSelCat("");
        setSelSub("");
        setSelTag("");
      } else if (type === "subcategories" && String(selSub) === String(id)) {
        setSelSub("");
        setSelTag("");
      } else if (type === "tags" && String(selTag) === String(id)) {
        setSelTag("");
      }
    };

    const handleError = (msg) => {
      setDeleteModal({ isOpen: false, id: null, type: "" });
      setActionError(msg);
    };

    if (type === "categories") {
      deleteCat.mutate(id, {
        onSuccess: handleSuccess,
        onError: (err) =>
          handleError(getErrorMsg(err, "category", "subcategories")),
      });
    } else if (type === "subcategories") {
      deleteSubCat.mutate(id, {
        onSuccess: handleSuccess,
        onError: (err) =>
          handleError(getErrorMsg(err, "subcategory", "tags or products")),
      });
    } else if (type === "tags") {
      deleteTag.mutate(id, {
        onSuccess: handleSuccess,
        onError: (err) => handleError(getErrorMsg(err, "tag", "products")),
      });
    } else if (type === "products") {
      deleteProd.mutate(id, {
        onSuccess: handleSuccess,
        onError: (err) =>
          handleError(
            err?.response?.data?.message ||
              "Something went wrong while trying to delete this product. Please try again.",
          ),
      });
    }
  };

  const handleSpecChange = (index, value) => {
    const newSpecs = [...(formData.specifications || [])];
    newSpecs[index] = value;
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };
  const addSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...(prev.specifications || []), ""],
    }));
  };
  const removeSpec = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue =
      name.includes("_id") && type !== "text" ? parseInt(value) || "" : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  useEffect(() => {
    if (formType === "products" && productEditId && productDetail) {
      const detail = productDetail.data || productDetail;

      if (detail && String(detail.product_id) === String(productEditId)) {
        const existingSpecs =
          Array.isArray(detail.specifications) && detail.specifications.length
            ? detail.specifications.map((s) =>
                typeof s === "string"
                  ? s
                  : s?.image || s?.image_url || s?.url || s?.file || "",
              )
            : [""];

        setFormData((prev) => ({
          ...prev,
          tag_id: detail.tag_id || prev.tag_id || selTag || "",
          name: detail.name || prev.name || "",
          tagline:
            detail.tagline || detail.original?.tagline || prev.tagline || "",
          description:
            detail.description ||
            detail.original?.description ||
            prev.description ||
            "",
          product_img:
            detail.product_img ||
            detail.product_image ||
            detail.image ||
            prev.product_img ||
            "",
          specifications: existingSpecs[0]
            ? existingSpecs
            : prev.specifications,
        }));
      }
    }
  }, [formType, productEditId, productDetail, selTag]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formType === "categories") {
      editingId
        ? updateCat.mutate(
            { category_id: editingId, ...formData },
            { onSuccess: () => setView("list") },
          )
        : createCat.mutate(formData, { onSuccess: () => setView("list") });
    } else if (formType === "subcategories") {
      editingId
        ? updateSubCat.mutate(
            { subcategory_id: editingId, ...formData },
            { onSuccess: () => setView("list") },
          )
        : createSubCat.mutate(formData, { onSuccess: () => setView("list") });
    } else if (formType === "tags") {
      editingId
        ? updateTag.mutate(
            { tag_id: editingId, ...formData },
            { onSuccess: () => setView("list") },
          )
        : createTag.mutate(formData, { onSuccess: () => setView("list") });
    } else if (formType === "products") {
      const cleanedSpecs = (formData.specifications || []).filter((s) =>
        typeof s === "string" ? s.trim() !== "" : true,
      );

      const payload = {
        tag_id: formData.tag_id || selTag,
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        product_img: formData.product_img,
        specifications: cleanedSpecs,
        downloads: [],
      };

      if (editingId) {
        updateProd.mutate(
          { product_id: editingId, ...payload },
          {
            onSuccess: () => {
              setView("list");
              setProductEditId(null);
              resetAllMutations();
            },
          },
        );
      } else {
        createProd.mutate(payload, {
          onSuccess: () => {
            setView("list");
            setProductEditId(null);
            resetAllMutations();
          },
        });
      }
    }
  };

  if (view === "form") {
    if (
      formType === "products" &&
      productEditId &&
      isProductDetailLoading &&
      !productDetail
    ) {
      return (
        <div className="py-20 flex flex-col justify-center items-center text-gray-400">
          <Loader2 className="animate-spin w-8 h-8 mb-4" />
          <span className="text-sm font-medium">
            {" "}
            Loading product details...
          </span>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8 w-full font-sans">
        <div className="max-w-3xl mx-auto bg-white border border-zinc-200 shadow-xl overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-200 bg-zinc-900 text-white">
            <h1 className="text-lg font-bold uppercase tracking-widest">
              {editingId
                ? `Edit ${formType.slice(0, -1)}`
                : `Create ${formType.slice(0, -1)}`}
            </h1>
            <button
              type="button"
              onClick={() => setView("list")}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {hasError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#da0e19] text-[#da0e19] text-sm font-medium rounded-r-md">
                  Something went wrong while processing your request. Please try
                  again.
                </div>
              )}

              {formType === "categories" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="category_name"
                      required
                      value={formData.category_name || ""}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                      Tagline
                    </label>
                    <input
                      type="text"
                      name="tagline"
                      required
                      value={formData.tagline || ""}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <FileUploader
                      label="Category Image *"
                      accept="image/jpeg, image/png, image/webp"
                      folder="categories"
                      currentFileUrl={formData.category_img}
                      onUploadSuccess={(url) =>
                        setFormData((prev) => ({ ...prev, category_img: url }))
                      }
                    />
                    <input
                      type="hidden"
                      name="category_img"
                      required
                      value={formData.category_img || ""}
                    />
                  </div>
                </>
              )}

              {formType === "subcategories" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                      Subcategory Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name || ""}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      required
                      rows="4"
                      value={formData.description || ""}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm resize-none disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <FileUploader
                      label="Subcategory Image *"
                      accept="image/jpeg, image/png, image/webp"
                      folder="subcategories"
                      currentFileUrl={formData.category_img}
                      onUploadSuccess={(url) =>
                        setFormData((prev) => ({ ...prev, category_img: url }))
                      }
                    />
                    <input
                      type="hidden"
                      name="category_img"
                      required
                      value={formData.category_img || ""}
                    />
                  </div>
                </>
              )}

              {formType === "tags" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                      Tag Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name || ""}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                    />
                  </div>
                </>
              )}

              {formType === "products" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name || ""}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                      Tagline *
                    </label>
                    <input
                      type="text"
                      name="tagline"
                      required
                      value={formData.tagline || ""}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      required
                      rows="4"
                      value={formData.description || ""}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm resize-none disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <FileUploader
                      label="Product Image *"
                      accept="image/jpeg, image/png, image/webp"
                      folder="products"
                      currentFileUrl={formData.product_img}
                      onUploadSuccess={(url) =>
                        setFormData((prev) => ({ ...prev, product_img: url }))
                      }
                    />
                    <input
                      type="hidden"
                      name="product_img"
                      required
                      value={formData.product_img || ""}
                    />
                  </div>

                  <div className="pt-4 border-t border-zinc-200">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest">
                        Specification Images
                      </label>
                      <button
                        type="button"
                        onClick={addSpec}
                        disabled={isSaving}
                        className="text-xs font-bold text-[#da0e19] uppercase tracking-widest flex items-center gap-1 hover:underline disabled:opacity-50 disabled:no-underline"
                      >
                        <FiPlus /> Add Spec Image
                      </button>
                    </div>
                    {formData.specifications?.map((spec, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-start mb-4 p-4 bg-zinc-50 border border-zinc-200 relative"
                      >
                        <div className="flex-1">
                          <FileUploader
                            label={`Specification Image ${index + 1}`}
                            accept="image/jpeg, image/png, image/webp"
                            folder="products/specifications"
                            currentFileUrl={spec}
                            onUploadSuccess={(url) =>
                              handleSpecChange(index, url)
                            }
                          />
                          <input type="hidden" required value={spec || ""} />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSpec(index)}
                          disabled={isSaving}
                          className="mt-6 p-3 bg-zinc-200 text-zinc-600 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center justify-center rounded-md"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-end pt-6 border-t border-zinc-200 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setView("list");
                    setProductEditId(null);
                  }}
                  disabled={isSaving}
                  className="px-6 py-3 border border-zinc-300 text-zinc-700 font-bold uppercase tracking-widest text-xs hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center min-w-[140px] gap-2 px-8 py-3 bg-[#da0e19] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
                      ? "Update"
                      : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8 w-full font-sans flex flex-col gap-6 relative">
      <div className="bg-white border border-zinc-200 shadow-sm p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
          <AiFillProduct className="text-[#da0e19] text-xl" />
          <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
            Products
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selCat}
            onChange={(e) => {
              setSelCat(e.target.value);
              setSelSub("");
              setSelTag("");
              setActionError("");
            }}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>

          <select
            value={selSub}
            onChange={(e) => {
              setSelSub(e.target.value);
              setSelTag("");
              setActionError("");
            }}
            disabled={!selCat}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-50 disabled:bg-zinc-100"
          >
            <option value=""> All Subcategories</option>
            {subcategories.map((s) => (
              <option key={s.subcategory_id} value={s.subcategory_id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selTag}
            onChange={(e) => {
              setSelTag(e.target.value);
              setActionError("");
            }}
            disabled={!selSub}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-50 disabled:bg-zinc-100"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t.tag_id} value={t.tag_id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm flex flex-col overflow-hidden relative">
        <div className="px-6 py-4 flex justify-between items-center border-b border-zinc-200 bg-zinc-900">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">
            {activeLevel} Records
          </h3>

          <div className="flex gap-3">
            {(selCat || selSub || selTag) && (
              <button
                onClick={() => {
                  setSelCat("");
                  setSelSub("");
                  setSelTag("");
                }}
                className="flex items-center gap-2 px-4 py-2 border border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Clear Filters
              </button>
            )}

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#da0e19] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              <FiPlus size={16} /> Add {activeLevel.slice(0, -1)}
            </button>
          </div>
        </div>

        {actionError && (
          <div className="m-6 mb-0 p-4 bg-red-50 border-l-4 border-[#da0e19] flex justify-between items-start">
            <span className="text-[#da0e19] text-sm font-medium">
              {actionError}
            </span>
            <button
              onClick={() => setActionError("")}
              className="text-red-500 hover:text-red-700 ml-4 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          {isLoading || (selCat && isDetailsLoading) ? (
            <div className="py-20 flex flex-col justify-center items-center text-gray-400">
              <Loader2 className="animate-spin w-8 h-8 mb-4" />
              <span className="text-sm font-medium">Loading Data</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse mt-2">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs font-bold tracking-widest uppercase">
                  <th className="py-4 px-6 w-24">Sr.</th>
                  <th className="py-4 px-6">Name</th>
                  {activeLevel === "categories" && (
                    <th className="py-4 px-6">Tagline</th>
                  )}
                  {activeLevel === "subcategories" && (
                    <th className="py-4 px-6">Description</th>
                  )}
                  {activeLevel === "products" && (
                    <th className="py-4 px-6">Tagline</th>
                  )}
                  <th className="py-4 px-6 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeLevel === "categories" &&
                  categories.map((item, index) => (
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
                      <td className="py-4 px-6 text-zinc-500 text-sm">
                        {item.tagline}
                      </td>
                      <td className="py-4 px-6 flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item, "categories")}
                          className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(item.category_id, "categories")
                          }
                          disabled={deleteCat.isPending}
                          className="p-2 text-zinc-400 hover:text-[#da0e19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeLevel === "subcategories" &&
                  subcategories.map((item) => (
                    <tr
                      key={item.subcategory_id}
                      className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors group"
                    >
                      <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                        #{String(item.subcategory_id).padStart(4, "0")}
                      </td>
                      <td className="py-4 px-6 text-zinc-900 font-bold">
                        {item.name}
                      </td>
                      <td className="py-4 px-6 text-zinc-500 text-sm truncate max-w-xs">
                        {item.description}
                      </td>
                      <td className="py-4 px-6 flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item, "subcategories")}
                          className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(
                              item.subcategory_id,
                              "subcategories",
                            )
                          }
                          disabled={deleteSubCat.isPending}
                          className="p-2 text-zinc-400 hover:text-[#da0e19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeLevel === "tags" &&
                  tags.map((item) => (
                    <tr
                      key={item.tag_id}
                      className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors group"
                    >
                      <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                        #{String(item.tag_id).padStart(4, "0")}
                      </td>
                      <td className="py-4 px-6 text-zinc-900 font-bold">
                        {item.name}
                      </td>
                      <td className="py-4 px-6 flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item, "tags")}
                          className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.tag_id, "tags")}
                          disabled={deleteTag.isPending}
                          className="p-2 text-zinc-400 hover:text-[#da0e19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {activeLevel === "products" &&
                  products.map((item) => (
                    <tr
                      key={item.product_id}
                      className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors group"
                    >
                      <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                        #{String(item.product_id).padStart(4, "0")}
                      </td>
                      <td className="py-4 px-6 text-zinc-900 font-bold">
                        {item.name}
                      </td>
                      <td className="py-4 px-6 text-zinc-500 text-sm">
                        {item.tagline}
                      </td>
                      <td className="py-4 px-6 flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item, "products")}
                          className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(item.product_id, "products")
                          }
                          disabled={deleteProd.isPending}
                          className="p-2 text-zinc-400 hover:text-[#da0e19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {((activeLevel === "categories" && categories.length === 0) ||
                  (activeLevel === "subcategories" &&
                    subcategories.length === 0) ||
                  (activeLevel === "tags" && tags.length === 0) ||
                  (activeLevel === "products" && products.length === 0)) &&
                  !isLoading && (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs"
                      >
                        No data found for this selection.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm  shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-zinc-900 flex justify-between items-center">
              <h3 className="text-white text-sm font-bold uppercase tracking-widest">
                Confirm Delete
              </h3>
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, id: null, type: "" })
                }
                disabled={isDeleting}
                className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-zinc-700 font-medium mb-8">
                Are you sure you want to delete this{" "}
                {deleteModal.type.slice(0, -1)}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setDeleteModal({ isOpen: false, id: null, type: "" })
                  }
                  disabled={isDeleting}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 px-4 py-2 min-w-[100px] bg-[#da0e19] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-70"
                >
                  {isDeleting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <FiTrash2 size={12} />
                  )}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
