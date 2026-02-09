import { apiGet, apiPost, apiPut, apiDelete } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const OrderService = {
  /**
   * Fetch all orders
   * @returns {Promise}
   */
  getOrders: () => apiGet(API.ORDER_MANAGEMENT.ORDERS.LIST),

  /**
   * Fetch a single order by ID
   * @param {string} orderId
   * @returns {Promise}
   */
  getOrderById: (orderId) => apiGet(API.ORDER_MANAGEMENT.ORDERS.DETAIL(orderId)),

  /**
   * Create a new order
   * @param {Object} orderData
   * @returns {Promise}
   */
  createOrder: (orderData) => apiPost(API.ORDER_MANAGEMENT.ORDERS.CREATE, orderData),

  /**
   * Update an existing order
   * @param {string} orderId
   * @param {Object} orderData
   * @returns {Promise}
   */
  updateOrder: (orderId, orderData) => apiPut(API.ORDER_MANAGEMENT.ORDERS.UPDATE(orderId), orderData),

  /**
   * Delete an order
   * @param {string} orderId
   * @returns {Promise}
   */
  deleteOrder: (orderId) => apiDelete(API.ORDER_MANAGEMENT.ORDERS.DETAIL(orderId)),

  /**
   * Fetch order dashboard overview
   * @returns {Promise}
   */
  getOrderDashboard: () => apiGet(API.ORDER_MANAGEMENT.DASHBOARD.OVERVIEW),

  /**
   * Fetch order dashboard overview with date filters
   * @param {Object} filters - Date filter parameters
   * @returns {Promise}
   */
  getOrderDashboardWithFilters: (filters = {}) =>
    apiGet(API.ORDER_MANAGEMENT.DASHBOARD.OVERVIEW, { params: filters }),

  getClientOrdersHistory: (clientId) =>
    apiGet(API.ORDER_MANAGEMENT.CLIENT_ORDERS.HISTORY(clientId)),

  assignOrder: (payload) => apiPost(API.ORDER_MANAGEMENT.ORDERS.ASSIGN, payload),

  /**
   * Fetch all allocations for the current user
   * @returns {Promise}
   */
  getAllocations: () => apiGet(API.ORDER_MANAGEMENT.ORDERS.ALLOCATION),
};

export default OrderService;
