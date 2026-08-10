import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

/**
 * ProductionService
 * -----------------------------------------------------------------------------
 * Backend contract for the Production Management module (ready-made clothing).
 *
 * Expected backend (Django / DRF) models under the `/production/` namespace:
 *
 *   ProductionOrder      — title, slug, description, category (inventory
 *                          category FK), status, priority, location,
 *                          created_by, order_created_at,
 *                          target_completion_date, completed_at,
 *                          total_quantity, completed_quantity, qa_data (JSON)
 *   ProductionAssignment — production_order FK, staff FK, assigned_quantity,
 *                          completed_quantity, status, assigned_at,
 *                          started_at, completed_at
 *   ProductionTimeline   — production_order FK, event_type, description, created_at
 *
 * Categories are the EXISTING inventory categories (inventories.InventoryCategory) —
 * production fills stock, so there is no separate production category table.
 *
 * Production order statuses:
 *   Pending → In Progress → QA Check → Completed | Cancelled
 *
 * Assignment statuses (per staff):
 *   Not Started → In Progress → QA Check → Completed
 */
const ProductionService = {
  // ---------------------------------------------------------------------------
  // Production Orders
  // ---------------------------------------------------------------------------
  listOrders: (params = {}) =>
    apiGet(API.PRODUCTION_MANAGEMENT.ORDERS.LIST, { params }),

  getOrderById: (id) =>
    apiGet(API.PRODUCTION_MANAGEMENT.ORDERS.DETAIL(id)),

  createOrder: (payload) =>
    apiPost(API.PRODUCTION_MANAGEMENT.ORDERS.CREATE, payload),

  updateOrder: (id, payload) =>
    apiPut(API.PRODUCTION_MANAGEMENT.ORDERS.UPDATE(id), payload),

  patchOrder: (id, payload) =>
    apiPatch(API.PRODUCTION_MANAGEMENT.ORDERS.UPDATE(id), payload),

  deleteOrder: (id) =>
    apiDelete(API.PRODUCTION_MANAGEMENT.ORDERS.DETAIL(id)),

  getDashboard: (params = {}) =>
    apiGet(API.PRODUCTION_MANAGEMENT.ORDERS.DASHBOARD, { params }),

  // The production orders assigned to the current (staff) user.
  getMyAssignments: (params = {}) =>
    apiGet(API.PRODUCTION_MANAGEMENT.ASSIGNMENTS.MY, { params }),

  // ---------------------------------------------------------------------------
  // Assignments
  // ---------------------------------------------------------------------------
  /**
   * Batch-assign a production order to one or more staff members.
   * @param {Object} payload { production_order, assignments: [{ staff, quantity, role, department }] }
   */
  assignOrder: (payload) =>
    apiPost(API.PRODUCTION_MANAGEMENT.ASSIGNMENTS.ASSIGN, payload),

  listAssignments: (params = {}) =>
    apiGet(API.PRODUCTION_MANAGEMENT.ASSIGNMENTS.LIST, { params }),

  getAssignmentById: (id) =>
    apiGet(API.PRODUCTION_MANAGEMENT.ASSIGNMENTS.DETAIL(id)),

  updateAssignment: (id, payload) =>
    apiPut(API.PRODUCTION_MANAGEMENT.ASSIGNMENTS.UPDATE(id), payload),

  patchAssignment: (id, payload) =>
    apiPatch(API.PRODUCTION_MANAGEMENT.ASSIGNMENTS.UPDATE(id), payload),

  /**
   * Mark a single staff assignment as complete (part of the order may remain).
   * @param {number} id - assignment id
   */
  completeAssignment: (id, payload = {}) =>
    apiPost(API.PRODUCTION_MANAGEMENT.ASSIGNMENTS.COMPLETE(id), payload),

  // ---------------------------------------------------------------------------
  // QA Checklist
  // ---------------------------------------------------------------------------
  getQA: (orderId) =>
    apiGet(API.PRODUCTION_MANAGEMENT.QA.GET(orderId)),

  saveQA: (orderId, payload) =>
    apiPut(API.PRODUCTION_MANAGEMENT.QA.SAVE(orderId), payload),

  completeQA: (orderId, payload = {}) =>
    apiPost(API.PRODUCTION_MANAGEMENT.QA.COMPLETE(orderId), payload),

  // ---------------------------------------------------------------------------
  // Complete & Add to Inventory
  // ---------------------------------------------------------------------------
  /**
   * Finalize a completed production order and add finished goods to inventory.
   * @param {number} orderId
   * @param {Object} payload { item_name, sku, category, quantity, unit_cost,
   *                           selling_price, location, unit_of_measurement }
   */
  completeOrder: (orderId, payload) =>
    apiPost(API.PRODUCTION_MANAGEMENT.COMPLETE.ADD_TO_INVENTORY(orderId), payload),

  // ---------------------------------------------------------------------------
  // Timeline
  // ---------------------------------------------------------------------------
  getTimeline: (orderId) =>
    apiGet(API.PRODUCTION_MANAGEMENT.TIMELINE.LIST(orderId)),

  addTimelineEvent: (orderId, payload) =>
    apiPost(API.PRODUCTION_MANAGEMENT.TIMELINE.CREATE(orderId), payload),

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------
  getReport: (params = {}) =>
    apiGet(API.PRODUCTION_MANAGEMENT.REPORT.SUMMARY, { params }),

  getReportByStaff: (params = {}) =>
    apiGet(API.PRODUCTION_MANAGEMENT.REPORT.SUMMARY_BY_STAFF, { params }),
};

export default ProductionService;
