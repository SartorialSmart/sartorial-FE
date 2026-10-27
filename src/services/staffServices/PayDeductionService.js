import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const PayDeductionService = {
  listDeductions: (params = {}) => {
    const config = Object.keys(params).length ? { params } : {};
    return apiGet(API.STAFF_MANAGEMENT.PAY_DEDUCTIONS.LIST, config);
  },

  createDeduction: (data) =>
    apiPost(API.STAFF_MANAGEMENT.PAY_DEDUCTIONS.CREATE, data),

  getDeductionDetail: (id) =>
    apiGet(API.STAFF_MANAGEMENT.PAY_DEDUCTIONS.DETAIL(id)),

  updateDeduction: (id, data) =>
    apiPut(API.STAFF_MANAGEMENT.PAY_DEDUCTIONS.UPDATE(id), data),

  deleteDeduction: (id) =>
    apiDelete(API.STAFF_MANAGEMENT.PAY_DEDUCTIONS.DELETE(id)),
};

export default PayDeductionService;
