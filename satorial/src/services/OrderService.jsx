import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const OrderService = {
  /**
   * Fetch all orders
   * @returns {Promise}
   */
  getOrders: (params = {}) => apiGet(API.ORDER_MANAGEMENT.ORDERS.LIST, { params }),

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
   * Partially update an existing order (PATCH)
   * @param {string} orderId
   * @param {Object} orderData
   * @returns {Promise}
   */
  patchOrder: (orderId, orderData) => apiPatch(API.ORDER_MANAGEMENT.ORDERS.UPDATE(orderId), orderData),

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

  /**
   * Orders assigned to the current (staff) user, with their work progress.
   * @returns {Promise}
   */
  getMyOrders: () => apiGet(API.ORDER_MANAGEMENT.ORDERS.MY_ORDERS),

  /**
   * Fetch the per-parameter work progress on one allocation.
   * @param {number|string} allocationId
   * @returns {Promise}
   */
  getAllocationProgress: (allocationId) =>
    apiGet(API.ORDER_MANAGEMENT.ORDERS.ALLOCATION_PROGRESS(allocationId)),

  /**
   * Update the per-parameter work progress on one allocation.
   * Payload: { progress: { <parameterKey>: 1-100, ... } }
   * @param {number|string} allocationId
   * @param {Object} progressMap
   * @returns {Promise}
   */
  updateAllocationProgress: (allocationId, progressMap) =>
    apiPut(API.ORDER_MANAGEMENT.ORDERS.ALLOCATION_PROGRESS(allocationId), { progress: progressMap }),

  /**
   * Admin mirror: every assignee's work progress on an order.
   * @param {string} orderId
   * @returns {Promise}
   */
  getOrderProgressReport: (orderId) => apiGet(API.ORDER_MANAGEMENT.ORDERS.PROGRESS_REPORT(orderId)),

  /**
   * Orders that materials can be dispensed against (assigned orders only).
   * @returns {Promise}
   */
  getDispensableOrders: () => apiGet(API.ORDER_MANAGEMENT.MATERIALS.DISPENSABLE_ORDERS),

  /**
   * An order's bill of materials with cost totals.
   * @param {string} orderId
   * @returns {Promise} { items, total_estimated_cost, planned_cost, dispensed_cost }
   */
  getOrderMaterials: (orderId) => apiGet(API.ORDER_MANAGEMENT.MATERIALS.LIST(orderId)),

  /**
   * Add an inventory item to an order's materials list.
   * Payload: { inventory, quantity, unit_cost? }
   * @param {string} orderId
   * @param {Object} payload
   * @returns {Promise}
   */
  addOrderMaterial: (orderId, payload) => apiPost(API.ORDER_MANAGEMENT.MATERIALS.LIST(orderId), payload),

  /**
   * Update a material line (quantity and/or unit cost).
   * @param {string} materialId
   * @param {Object} payload
   * @returns {Promise}
   */
  updateOrderMaterial: (materialId, payload) => apiPatch(API.ORDER_MANAGEMENT.MATERIALS.DETAIL(materialId), payload),

  /**
   * Remove a planned (not yet dispensed) material line.
   * @param {string} materialId
   * @returns {Promise}
   */
  deleteOrderMaterial: (materialId) => apiDelete(API.ORDER_MANAGEMENT.MATERIALS.DETAIL(materialId)),

  /**
   * Dispense a material line to the order's assignee (deducts stock).
   * @param {string} materialId
   * @returns {Promise}
   */
  dispenseOrderMaterial: (materialId) => apiPost(API.ORDER_MANAGEMENT.MATERIALS.DISPENSE(materialId), {}),

  /**
   * Dispense every planned material line of an order at once (all-or-nothing).
   * @param {string} orderId
   * @returns {Promise} Refreshed materials report with cost totals.
   */
  dispenseAllOrderMaterials: (orderId) => apiPost(API.ORDER_MANAGEMENT.MATERIALS.DISPENSE_ALL(orderId), {}),
};

export default OrderService;
