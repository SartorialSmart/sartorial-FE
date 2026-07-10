import { apiGet, apiPost } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const StockMovementService = {
  listMovements: (params = {}) => apiGet(API.INVENTORY_MANAGEMENT.STOCK_MOVEMENTS.LIST, { params }),

  getMovement: (id) => apiGet(API.INVENTORY_MANAGEMENT.STOCK_MOVEMENTS.DETAIL(id)),

  createMovement: (data) => apiPost(API.INVENTORY_MANAGEMENT.STOCK_MOVEMENTS.CREATE, data),
};

export default StockMovementService;
