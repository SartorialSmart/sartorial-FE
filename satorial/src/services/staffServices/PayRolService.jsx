import { apiGet, apiPost } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const PayRollService = {
  createPayroll: (payload) =>
    apiPost(API.STAFF_MANAGEMENT.PAYROLL.ADD, payload),

  listPayrolls: () => apiGet(API.STAFF_MANAGEMENT.PAYROLL.LIST),

  getPayrollDetail: (payrollId) =>
    apiGet(API.STAFF_MANAGEMENT.PAYROLL.DETAIL(payrollId)),

  listRecords: (params = {}) => {
    const config = Object.keys(params).length ? { params } : {};
    return apiGet(API.STAFF_MANAGEMENT.PAYROLL_RECORDS.LIST, config);
  },

  getRecordDetail: (id) =>
    apiGet(API.STAFF_MANAGEMENT.PAYROLL_RECORDS.DETAIL(id)),

  finalizeRecord: (id) =>
    apiPost(API.STAFF_MANAGEMENT.PAYROLL_RECORDS.FINALIZE(id)),

  bulkFinalize: (payload) =>
    apiPost(API.STAFF_MANAGEMENT.PAYROLL_RECORDS.BULK_FINALIZE, payload),

  exportRecords: (params = {}) => {
    const config = Object.keys(params).length ? { params, responseType: "blob" } : { responseType: "blob" };
    return apiGet(API.STAFF_MANAGEMENT.PAYROLL_RECORDS.EXPORT, config);
  },

  getDashboard: () => apiGet(API.STAFF_MANAGEMENT.PAYROLL_DASHBOARD.SUMMARY),
};

export default PayRollService;
