import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const OrderCategoryService = {
  /**
   * Fetch all order categories
   * @returns {Promise}
   */
  getCategories: async () => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.ORDER_CATEGORIES.LIST);
      return response.data;
    } catch (error) {
      console.error("Error fetching order categories:", error);
      throw error;
    }
  },

  /**
   * Fetch a single order category by ID
   * @param {string} categoryId
   * @returns {Promise}
   */
  getCategoryById: async (categoryId) => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.ORDER_CATEGORIES.DETAIL(categoryId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching order category ${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new order category
   * @param {Object} categoryData
   * @returns {Promise}
   */
  createCategory: async (categoryData) => {
    try {
      const response = await axiosInstance.post(API.ORDER_MANAGEMENT.ORDER_CATEGORIES.CREATE, categoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating order category:", error);
      throw error;
    }
  },

  /**
   * Update an existing order category
   * @param {string} categoryId
   * @param {Object} categoryData
   * @returns {Promise}
   */
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await axiosInstance.put(API.ORDER_MANAGEMENT.ORDER_CATEGORIES.DETAIL(categoryId), categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating order category ${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an order category
   * @param {string} categoryId
   * @returns {Promise}
   */
  deleteCategory: async (categoryId) => {
    try {
      const response = await axiosInstance.delete(API.ORDER_MANAGEMENT.ORDER_CATEGORIES.DETAIL(categoryId));
      return response.data;
    } catch (error) {
      console.error(`Error deleting order category ${categoryId}:`, error);
      throw error;
    }
  },
};

export default OrderCategoryService;
