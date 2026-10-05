import api from "../api";

export const fetchProuctsForHeader = async () => {
  try {
    const response = await api.get("products/");
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "fetch header data for header failed",
    );
  }
};

export const fetchPerticulerProduct = async (product_id) => {
  try {
    const response = await api.get(`products/products/${product_id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || "product data failed");
  }
};
export const fetchCategories = async () => {
  try {
    const response = await api.get("products/categories/");
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Fetch categories failed",
    );
  }
};

export const fetchCategoryDetails = async (category_id) => {
  try {
    const response = await api.get(`products/categories/${category_id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Fetch category details failed",
    );
  }
};
