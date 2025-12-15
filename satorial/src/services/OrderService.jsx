import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const OrderService = {
  /**
   * Fetch all orders
   * @returns {Promise}
   */
  getOrders: async () => {
    try {
      const response = await axiosInstance.get(
        API.ORDER_MANAGEMENT.ORDERS.LIST
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  /**
   * Fetch a single order by ID
   * @param {string} orderId
   * @returns {Promise}
   */
  getOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(
        API.ORDER_MANAGEMENT.ORDERS.DETAIL(orderId)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new order
   * @param {Object} orderData
   * @returns {Promise}
   */
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post(
        API.ORDER_MANAGEMENT.ORDERS.CREATE,
        orderData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  /**
   * Update an existing order
   * @param {string} orderId
   * @param {Object} orderData
   * @returns {Promise}
   */
  updateOrder: async (orderId, orderData) => {
    try {
      const response = await axiosInstance.put(
        API.ORDER_MANAGEMENT.ORDERS.UPDATE(orderId),
        orderData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an order
   * @param {string} orderId
   * @returns {Promise}
   */
  deleteOrder: async (orderId) => {
    try {
      const response = await axiosInstance.delete(
        API.ORDER_MANAGEMENT.ORDERS.DETAIL(orderId)
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch order dashboard overview
   * @returns {Promise}
   */
  getOrderDashboard: async () => {
    try {
      const response = await axiosInstance.get(
        API.ORDER_MANAGEMENT.DASHBOARD.OVERVIEW
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching order dashboard data:", error);
      throw error;
    }
  },

  /**
   * Fetch order dashboard overview with date filters
   * @param {Object} filters - Date filter parameters
   * @returns {Promise}
   */
  getOrderDashboardWithFilters: async (filters = {}) => {
    try {
      const response = await axiosInstance.get(
        API.ORDER_MANAGEMENT.DASHBOARD.OVERVIEW,
        { params: filters }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching filtered order dashboard data:", error);
      throw error;
    }
  },

  getClientOrdersHistory: async (clientId) => {
    try {
      const response = await axiosInstance.get(
        API.ORDER_MANAGEMENT.CLIENT_ORDERS.HISTORY(clientId)
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching client orders history for ${clientId}:`,
        error
      );
      throw error;
    }
  },

  assignOrder: async (payload) => {
    try {
      const response = await axiosInstance.post(
        API.ORDER_MANAGEMENT.ORDERS.ASSIGN,
        payload
      );
      return response.data;
    } catch (error) {
      console.error(`Error assigning order:`, error);
      throw error;
    }
  },

  /**
   * Fetch all allocations for the current user
   * @returns {Promise}
   */
  getAllocations: async () => {
    try {
      const response = await axiosInstance.get(
        API.ORDER_MANAGEMENT.ORDERS.ALLOCATION
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching allocations:", error);
      throw error;
    }
  },
};

export default OrderService;