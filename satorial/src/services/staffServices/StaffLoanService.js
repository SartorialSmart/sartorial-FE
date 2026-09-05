import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const StaffLoanService = {
  listLoans: (params = {}) => {
    const config = Object.keys(params).length ? { params } : {};
    return apiGet(API.STAFF_MANAGEMENT.STAFF_LOANS.LIST, config);
  },

  createLoan: (data) =>
    apiPost(API.STAFF_MANAGEMENT.STAFF_LOANS.CREATE, data),

  getLoanDetail: (id) =>
    apiGet(API.STAFF_MANAGEMENT.STAFF_LOANS.DETAIL(id)),

  updateLoan: (id, data) =>
    apiPut(API.STAFF_MANAGEMENT.STAFF_LOANS.UPDATE(id), data),

  deleteLoan: (id) =>
    apiDelete(API.STAFF_MANAGEMENT.STAFF_LOANS.DELETE(id)),
};

export default StaffLoanService;
