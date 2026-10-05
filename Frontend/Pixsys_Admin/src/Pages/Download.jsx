import React, { useMemo, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiDownload,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import {
  useAllDownloads,
  useUpdateDownload,
  useDeleteDownload,
  useCreateDownload,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from "../hooks/useDownloads";
import { useAdminProductsData, useCategoryDetails } from "../hooks/useProducts";

import FileUploader from "../Components/FileUploader";

const emptyDownload = {
  product_id: "",
  tag_id: "",
  subcategory_id: "",
  category_id: "",
  name: "",
  resource_url: "",
  resource_type: "SOFTWARE",
  description: "",
  thumbnail: "",
};

const Download = () => {
  const { data, isLoading: isDownloadsLoading } = useAllDownloads();
  const updateMutation = useUpdateDownload();
  const deleteMutation = useDeleteDownload();
  const createMutation = useCreateDownload();
  const createResMutation = useCreateResource();
  const updateResMutation = useUpdateResource();
  const deleteResMutation = useDeleteResource();

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    createResMutation.isPending ||
    updateResMutation.isPending;

  const hasError =
    createMutation.isError ||
    updateMutation.isError ||
    createResMutation.isError ||
    updateResMutation.isError;

  const resetMutations = () => {
    createMutation.reset();
    updateMutation.reset();
    createResMutation.reset();
    updateResMutation.reset();
  };

  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyDownload);
  const [originalData, setOriginalData] = useState(null);

  const [selCat, setSelCat] = useState("");
  const [selSub, setSelSub] = useState("");
  const [selTag, setSelTag] = useState("");
  const [selProd, setSelProd] = useState("");

  const { data: productsData } = useAdminProductsData();
  const { data: detailedCategoryData, isLoading: isDetailsLoading } =
    useCategoryDetails(selCat);

  const categories = useMemo(() => {
    if (Array.isArray(productsData)) return productsData;
    if (productsData?.data && Array.isArray(productsData.data))
      return productsData.data;
    return [];
  }, [productsData]);

  const subOptions = useMemo(() => {
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
      subOptions.find((s) => String(s.subcategory_id) === String(selSub)) ||
      null
    );
  }, [subOptions, selSub]);

  const tagOptions = useMemo(
    () => currentSubcategory?.tags || [],
    [currentSubcategory],
  );

  const currentTag = useMemo(() => {
    if (!selTag) return null;
    return tagOptions.find((t) => String(t.tag_id) === String(selTag)) || null;
  }, [tagOptions, selTag]);

  const prodOptions = useMemo(() => currentTag?.products || [], [currentTag]);

  const productHierarchyMap = useMemo(() => {
    const map = new Map();
    const processCategory = (cat) => {
      if (!cat) return;
      const catId = cat.category_id || cat.id || "";
      const catProds = cat.products || [];
      catProds.forEach((p) => {
        const pId = p?.product_id || p?.id;
        if (pId) {
          map.set(String(pId), {
            category_id: catId,
            subcategory_id: p.subcategory_id || "",
            tag_id: p.tag_id || "",
          });
        }
      });
      const subs = cat.subcategories || cat.sub_categories || [];
      subs.forEach((sub) => {
        const subId = sub.subcategory_id || sub.id || "";
        const subProds = sub.products || [];
        subProds.forEach((p) => {
          const pId = p?.product_id || p?.id;
          if (pId) {
            map.set(String(pId), {
              category_id: catId,
              subcategory_id: subId,
              tag_id: p.tag_id || "",
            });
          }
        });
        const tags = sub.tags || [];
        tags.forEach((tag) => {
          const tagId = tag.tag_id || tag.id || "";
          const tagProds = tag.products || [];
          tagProds.forEach((p) => {
            const pId = p?.product_id || p?.id;
            if (pId) {
              map.set(String(pId), {
                category_id: catId,
                subcategory_id: subId,
                tag_id: tagId,
              });
            }
          });
        });
      });
    };

    categories.forEach(processCategory);
    if (detailedCategoryData) {
      if (Array.isArray(detailedCategoryData)) {
        detailedCategoryData.forEach(processCategory);
      } else {
        processCategory(detailedCategoryData.data || detailedCategoryData);
      }
    }
    return map;
  }, [categories, detailedCategoryData]);

  const getChildProductsForSelection = (
    subcategories,
    categoryData,
    catId,
    subId,
    tagId,
    prodId
  ) => {
    const results = [];
    const seen = new Set();
    if (!catId) return results;

    const addProduct = (prod, subcatId, tId) => {
      if (!prod || !prod.product_id) return;
      if (prodId && String(prod.product_id) !== String(prodId)) return;
      if (!seen.has(String(prod.product_id))) {
        seen.add(String(prod.product_id));
        results.push({
          category_id: catId || prod.category_id || "",
          subcategory_id: subcatId || prod.subcategory_id || "",
          tag_id: tId || prod.tag_id || "",
          product_id: prod.product_id,
          name: prod.name || "",
        });
      }
    };

    // 1. Direct products on category
    const catProducts =
      categoryData?.products || categoryData?.data?.products || [];
    for (const prod of catProducts) {
      addProduct(prod, prod.subcategory_id || "", prod.tag_id || "");
    }

    // 2. Subcategories -> tags/products
    if (Array.isArray(subcategories)) {
      for (const sub of subcategories) {
        if (subId && String(sub.subcategory_id) !== String(subId)) continue;

        // Direct products on subcategory
        const subProducts = sub.products || [];
        for (const prod of subProducts) {
          addProduct(prod, sub.subcategory_id, prod.tag_id || "");
        }

        // Products in tags
        const tags = sub.tags || [];
        for (const tag of tags) {
          if (tagId && String(tag.tag_id) !== String(tagId)) continue;
          const products = tag.products || [];
          for (const prod of products) {
            addProduct(prod, sub.subcategory_id, tag.tag_id);
          }
        }
      }
    }

    return results;
  };

  const targetProducts = useMemo(() => {
    if (!selCat) return [];
    return getChildProductsForSelection(
      subOptions,
      detailedCategoryData,
      selCat,
      selSub,
      selTag,
      selProd
    );
  }, [subOptions, detailedCategoryData, selCat, selSub, selTag, selProd]);

  const canAddDownload = Boolean(selCat || selProd);

  const _raw = data?.data ?? data?.results ?? data ?? [];
  const allDownloads = Array.isArray(_raw)
    ? _raw
    : typeof _raw === "object" && _raw !== null
      ? Object.values(_raw).flat().filter(Boolean)
      : [];

  // const allDownloads = useMemo(() => {
  //   const raw = data;
  //   if (Array.isArray(raw)) return raw;
  //   if (raw?.data && Array.isArray(raw.data)) return raw.data;
  //   if (raw?.results && Array.isArray(raw.results)) return raw.results;
  //   return [];
  // }, [data]);


  const filteredDownloads = useMemo(() => {
    return allDownloads.filter((d) => {
      const prodId =
        d.product_id ??
        d.product?.product_id ??
        d.product?.id ??
        d.product ??
        "";
      const hierarchy = prodId ? productHierarchyMap.get(String(prodId)) : null;

      const dCat =
        d.category_id ??
        d.category?.category_id ??
        d.category?.id ??
        d.category ??
        hierarchy?.category_id ??
        "";
      const dSub =
        d.subcategory_id ??
        d.subcategory?.subcategory_id ??
        d.subcategory?.id ??
        d.subcategory ??
        hierarchy?.subcategory_id ??
        "";
      const dTag =
        d.tag_id ??
        d.tag?.tag_id ??
        d.tag?.id ??
        d.tag ??
        hierarchy?.tag_id ??
        "";

      if (selProd && String(prodId) !== String(selProd)) return false;
      if (selTag && String(dTag) !== String(selTag)) return false;
      if (selSub && String(dSub) !== String(selSub)) return false;
      if (selCat && String(dCat) !== String(selCat)) return false;
      return true;
    });
  }, [allDownloads, selCat, selSub, selTag, selProd, productHierarchyMap]);

  const handleOpenCreate = () => {
    resetMutations();
    setEditingId(null);

    const initialFormState = {
      ...emptyDownload,
      category_id: selCat || "",
      subcategory_id: selSub || "",
      tag_id: selTag || "",
      product_id: selProd || "",
    };

    setFormData(initialFormState);
    setOriginalData(initialFormState);
    setView("form");
  };

  const handleOpenEdit = (d) => {
    resetMutations();

    // Accurately deduce the type so the dropdown isn't stuck on "SOFTWARE"
    const actualType = d.resource_id
      ? "RESOURCE"
      : d.resource_type || "SOFTWARE";

    setEditingId(d.download_id || d.resource_id);
    setSelCat(d.category_id ?? "");
    setSelSub(d.subcategory_id ?? "");
    setSelTag(d.tag_id ?? "");
    setSelProd(d.product_id ?? "");

    const initialFormState = {
      product_id: d.product_id ?? "",
      tag_id: d.tag_id ?? "",
      subcategory_id: d.subcategory_id ?? "",
      category_id: d.category_id ?? "",
      name: d.name ?? "",
      resource_url: d.resource_url ?? "",
      resource_type: String(actualType).toUpperCase(),
      description: d.description ?? "",
      thumbnail: d.thumbnail ?? "",
    };

    setFormData(initialFormState);
    setOriginalData(initialFormState);
    setView("form");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resource_type") {
      // If the user reverts to the original type, restore their original files
      if (originalData && originalData.resource_type === value) {
        setFormData((prev) => ({
          ...prev,
          resource_type: value,
          resource_url: originalData.resource_url || "",
          description: originalData.description || "",
          thumbnail: originalData.thumbnail || "",
        }));
      } else {
        // If they select a new type, completely clear the upload/resource fields
        setFormData((prev) => ({
          ...prev,
          resource_type: value,
          resource_url: "",
          description: "",
          thumbnail: "",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && !formData.product_id) {
      if (formData.resource_type !== "SOFTWARE") {
        alert(
          `Please select a specific Product for ${formData.resource_type}. Bulk upload to all child products is only available for SOFTWARE.`
        );
        return;
      }
    }

    try {
      const isResource = formData.resource_type === "RESOURCE";
      if (editingId) {
        if (isResource) {
          await updateResMutation.mutateAsync({
            ...formData,
            resource_id: editingId,
          });
        } else {
          await updateMutation.mutateAsync({
            ...formData,
            download_id: editingId,
          });
        }
      } else {
        if (isResource) {
          await createResMutation.mutateAsync({ ...formData });
        } else if (
          formData.resource_type === "SOFTWARE" &&
          !formData.product_id
        ) {
          if (targetProducts.length === 0) {
            alert(
              "No child products found under the selected category/subcategory to apply this software."
            );
            return;
          }
          const results = await Promise.allSettled(
            targetProducts.map((prod) =>
              createMutation.mutateAsync({
                ...formData,
                category_id: prod.category_id || selCat || "",
                subcategory_id: prod.subcategory_id || selSub || "",
                tag_id: prod.tag_id || selTag || "",
                product_id: prod.product_id,
              })
            )
          );

          const failed = results.filter((r) => r.status === "rejected");
          if (failed.length === results.length) {
            alert(
              "Failed to upload software to child products. Please try again."
            );
            return;
          } else if (failed.length > 0) {
            alert(
              `Software uploaded to ${results.length - failed.length} product(s), but failed for ${failed.length} product(s).`
            );
          }
        } else {
          await createMutation.mutateAsync({ ...formData });
        }
      }
      setView("list");
    } catch (err) { }
  };

  const handleDelete = async (item) => {
    const isResource =
      item.resource_type === "RESOURCE" ||
      (!item.download_id && Boolean(item.resource_id));
    const targetId = isResource
      ? item.resource_id || item.id
      : item.download_id || item.id || item.resource_id;

    if (!targetId) {
      alert("Error: Could not find a valid ID to delete.");
      return;
    }

    if (window.confirm("Delete this item?")) {
      try {
        if (isResource) {
          await deleteResMutation.mutateAsync(targetId);
        } else {
          await deleteMutation.mutateAsync(targetId);
        }
      } catch (err) {
        alert("Something went wrong while trying to delete this item.");
      }
    }
  };

  if (view === "form") {
    return (
      <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8 w-full font-sans">
        <div className="max-w-3xl mx-auto bg-white border border-zinc-200 shadow-xl overflow-hidden">
          <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-200 bg-zinc-900 text-white">
            <h1 className="text-lg font-bold uppercase tracking-widest">
              {editingId ? "Edit Download" : "Create Download"}
            </h1>
            <button
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

              {/* FIRST ROW: Name and Resource Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                    Name *
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
                    Resource Type *
                  </label>
                  <select
                    name="resource_type"
                    value={formData.resource_type || "SOFTWARE"}
                    onChange={handleChange}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-60"
                  >
                    <option value="SOFTWARE">SOFTWARE</option>
                    <option value="SOFTWARE_MANUAL">SOFTWARE_MANUAL</option>
                    <option value="CATALOG">CATALOG</option>
                    <option value="DIMENTION">DIMENTION</option>
                    <option value="RESOURCE">RESOURCE</option>
                  </select>
                </div>
              </div>

              {/* SECOND ROW: Description and Thumbnail (Only if RESOURCE) */}
              {formData.resource_type === "RESOURCE" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-200">
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows="4"
                      value={formData.description || ""}
                      onChange={handleChange}
                      disabled={isSaving}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <FileUploader
                      label="Upload Thumbnail *"
                      accept="image/*"
                      folder="thumbnails"
                      currentFileUrl={formData.thumbnail}
                      onUploadSuccess={(url) =>
                        setFormData((prev) => ({ ...prev, thumbnail: url }))
                      }
                    />
                    <input
                      type="hidden"
                      name="thumbnail"
                      required={formData.resource_type === "RESOURCE"}
                      value={formData.thumbnail || ""}
                    />
                  </div>
                </div>
              )}

              {/* THIRD ROW: Resource URL Upload */}
              <div className="pt-6 border-t border-zinc-200">
                <FileUploader
                  label={`Upload ${formData.resource_type.replace("_", " ")} File *`}
                  accept={
                    formData.resource_type.includes("SOFTWARE")
                      ? ".exe,.zip,.rar,.msi,.eds"
                      : ".pdf,image/*,.stp,.dxf,.dwg,.eds,.zip,.rar"
                  }
                  folder={formData.resource_type.toLowerCase()}
                  currentFileUrl={formData.resource_url}
                  onUploadSuccess={(url) =>
                    setFormData((prev) => ({ ...prev, resource_url: url }))
                  }
                />

                <input
                  type="hidden"
                  name="resource_url"
                  required
                  value={formData.resource_url || ""}
                />
              </div>

              {/* FOURTH ROW: Product Linkage */}
              <div className="pt-6 border-t border-zinc-200">
                <h3 className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-4">
                  Product Linkage *
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={selCat}
                    onChange={(e) => {
                      setSelCat(e.target.value);
                      setSelSub("");
                      setSelTag("");
                      setSelProd("");
                      setFormData((s) => ({
                        ...s,
                        category_id: e.target.value,
                        subcategory_id: "",
                        tag_id: "",
                        product_id: "",
                      }));
                    }}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700"
                  >
                    <option value="">Select Category</option>
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
                      setSelProd("");
                      setFormData((s) => ({
                        ...s,
                        subcategory_id: e.target.value,
                        tag_id: "",
                        product_id: "",
                      }));
                    }}
                    disabled={!selCat}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-50 disabled:bg-zinc-100"
                  >
                    <option value="">
                      {formData.resource_type === "SOFTWARE" && !editingId
                        ? "All Subcategories (Apply to all)"
                        : "Select Subcategory"}
                    </option>
                    {subOptions.map((s) => (
                      <option key={s.subcategory_id} value={s.subcategory_id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selTag}
                    onChange={(e) => {
                      setSelTag(e.target.value);
                      setSelProd("");
                      setFormData((s) => ({
                        ...s,
                        tag_id: e.target.value,
                        product_id: "",
                      }));
                    }}
                    disabled={!selSub}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-50 disabled:bg-zinc-100"
                  >
                    <option value="">
                      {formData.resource_type === "SOFTWARE" && !editingId
                        ? "All Tags (Apply to all)"
                        : "Select Tag"}
                    </option>
                    {tagOptions.map((t) => (
                      <option key={t.tag_id} value={t.tag_id}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selProd}
                    required={
                      formData.resource_type !== "SOFTWARE" || !!editingId
                    }
                    onChange={(e) => {
                      setSelProd(e.target.value);
                      setFormData((s) => ({
                        ...s,
                        product_id: e.target.value,
                      }));
                    }}
                    disabled={!selTag}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-50 disabled:bg-zinc-100"
                  >
                    <option value="">
                      {formData.resource_type === "SOFTWARE" && !editingId
                        ? "All Child Products (Apply to all)"
                        : "Select Product"}
                    </option>
                    {prodOptions.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.resource_type === "SOFTWARE" &&
                  !editingId &&
                  !selProd &&
                  selCat && (
                    <div
                      className={`mt-4 p-3 border text-xs font-medium rounded flex items-center gap-2 ${isDetailsLoading
                        ? "bg-zinc-100 border-zinc-300 text-zinc-700"
                        : targetProducts.length > 0
                          ? "bg-blue-50 border-blue-200 text-blue-800"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                        }`}
                    >
                      <span className="text-sm">
                        {isDetailsLoading
                          ? "⏳"
                          : targetProducts.length > 0
                            ? "ℹ️"
                            : "⚠️"}
                      </span>
                      <span>
                        {isDetailsLoading ? (
                          "Loading child products for the selected category..."
                        ) : targetProducts.length > 0 ? (
                          <>
                            Bulk Software Upload: This software will be
                            automatically added to{" "}
                            <strong className="font-bold">
                              all {targetProducts.length} child product(s)
                            </strong>{" "}
                            under the selected category/subcategory.
                          </>
                        ) : (
                          "No child products found under the selected category/subcategory."
                        )}
                      </span>
                    </div>
                  )}
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
                  disabled={
                    isSaving ||
                    (!editingId &&
                      formData.resource_type === "SOFTWARE" &&
                      !formData.product_id &&
                      (isDetailsLoading || targetProducts.length === 0))
                  }
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
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8 w-full font-sans flex flex-col gap-6">
      <div className="bg-white border border-zinc-200 shadow-sm p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
          <FiDownload className="text-[#da0e19] text-xl" />
          <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
            Downloads
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={selCat}
            onChange={(e) => {
              setSelCat(e.target.value);
              setSelSub("");
              setSelTag("");
              setSelProd("");
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
              setSelProd("");
            }}
            disabled={!selCat}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-50 disabled:bg-zinc-100"
          >
            <option value=""> All Subcategories</option>
            {subOptions.map((s) => (
              <option key={s.subcategory_id} value={s.subcategory_id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selTag}
            onChange={(e) => {
              setSelTag(e.target.value);
              setSelProd("");
            }}
            disabled={!selSub}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-50 disabled:bg-zinc-100"
          >
            <option value="">All Tags</option>
            {tagOptions.map((t) => (
              <option key={t.tag_id} value={t.tag_id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={selProd}
            onChange={(e) => setSelProd(e.target.value)}
            disabled={!selTag}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm font-bold uppercase tracking-widest text-zinc-700 disabled:opacity-50 disabled:bg-zinc-100"
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

      <div className="bg-white border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-4 flex justify-between items-center border-b border-zinc-200 bg-zinc-900">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">
            Download Records
          </h3>
          <div className="flex gap-3">
            {(selCat || selSub || selTag || selProd) && (
              <button
                onClick={() => {
                  setSelCat("");
                  setSelSub("");
                  setSelTag("");
                  setSelProd("");
                }}
                className="flex items-center gap-2 px-4 py-2 border border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Clear Filters
              </button>
            )}

            <div
              className="inline-block cursor-not-allowed"
              title={
                !canAddDownload
                  ? "First select a category or product to add a new download."
                  : ""
              }
            >
              <button
                onClick={handleOpenCreate}
                disabled={!canAddDownload}
                className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-bold uppercase tracking-widest transition-colors ${!canAddDownload
                  ? "bg-zinc-400 opacity-60 pointer-events-none"
                  : "bg-[#da0e19] hover:bg-red-700"
                  }`}
              >
                <FiPlus size={16} /> Add Download
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          {isDownloadsLoading || (selCat && isDetailsLoading) ? (
            <div className="py-20 flex flex-col justify-center items-center text-gray-400">
              <Loader2 className="animate-spin w-8 h-8 mb-4" />
              <span className="text-sm font-medium">Loading Downloads...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs font-bold tracking-widest uppercase">
                  <th className="py-4 px-6 w-24">Sr.</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Resource URL</th>
                  <th className="py-4 px-6 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDownloads.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs"
                    >
                      No downloads found for this selection.
                    </td>
                  </tr>
                ) : (
                  filteredDownloads.map((d, index) => {
                    // Deducing Type safely for the UI Table
                    const rowType = d.resource_id
                      ? "RESOURCE"
                      : d.resource_type || "SOFTWARE";

                    return (
                      <tr
                        key={d.download_id || d.resource_id || index}
                        className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors group"
                      >
                        <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                          {index + 1}
                        </td>
                        <td className="py-4 px-6 text-zinc-900 font-bold">
                          {d.name}
                        </td>
                        <td className="py-4 px-6 text-zinc-500 text-xs font-bold uppercase">
                          {rowType}
                        </td>
                        <td className="py-4 px-6 text-zinc-500 text-sm truncate max-w-xs">
                          <a
                            href={d.resource_url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-[#da0e19] hover:underline"
                          >
                            {d.resource_url}
                          </a>
                        </td>
                        <td className="py-4 px-6 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(d)}
                            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(d)}
                            disabled={
                              deleteMutation.isPending ||
                              (typeof deleteResMutation !== "undefined" &&
                                deleteResMutation.isPending)
                            }
                            className="p-2 text-zinc-400 hover:text-[#da0e19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Download;
