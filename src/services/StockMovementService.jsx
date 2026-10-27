import { apiGet, apiPost, apiPut, apiDelete } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const StockMovementService = {
  listMovements: (params = {}) => apiGet(API.INVENTORY_MANAGEMENT.STOCK_MOVEMENTS.LIST, { params }),

  getMovement: (id) => apiGet(API.INVENTORY_MANAGEMENT.STOCK_MOVEMENTS.DETAIL(id)),

  createMovement: (data) => apiPost(API.INVENTORY_MANAGEMENT.STOCK_MOVEMENTS.CREATE, data),

  updateMovement: (id, data) => apiPut(API.INVENTORY_MANAGEMENT.STOCK_MOVEMENTS.UPDATE(id), data),

  deleteMovement: (id) => apiDelete(API.INVENTORY_MANAGEMENT.STOCK_MOVEMENTS.DELETE(id)),
};

export default StockMovementService;
