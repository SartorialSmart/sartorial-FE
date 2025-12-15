import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const VendorCategoryService = {
  // ✅ Create a new vendor category
  createCategory: async (categoryData) => {
    try {
      const response = await axiosInstance.post(API.ORDER_MANAGEMENT.VENDOR_CATEGORIES.CREATE, categoryData);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating vendor category:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to create vendor category. Please try again.");
    }
  },

  // ✅ Fetch the list of all vendor categories
  getCategoriesList: async () => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.VENDOR_CATEGORIES.LIST);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching vendor categories list:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch vendor categories list. Please try again.");
    }
  },

  // ✅ Fetch vendor category details by ID
  getCategoryDetails: async (categoryId) => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.VENDOR_CATEGORIES.DETAIL(categoryId));
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching vendor category details (ID: ${categoryId}):`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || `Failed to fetch details for vendor category ID: ${categoryId}.`);
    }
  },

  // ✅ Fetch vendor categories with bill counts
  getCategoriesWithBillCount: async () => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.VENDOR_CATEGORIES.WITH_BILL_COUNT);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching vendor categories with bill count:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch vendor categories with bill count.");
    }
  },
};

export default VendorCategoryService;
