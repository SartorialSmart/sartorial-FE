import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const PayrollPeriodService = {
  listPeriods: (params = {}) => {
    const config = Object.keys(params).length ? { params } : {};
    return apiGet(API.STAFF_MANAGEMENT.PAYROLL_PERIODS.LIST, config);
  },

  createPeriod: (data) =>
    apiPost(API.STAFF_MANAGEMENT.PAYROLL_PERIODS.CREATE, data),

  getPeriodDetail: (id) =>
    apiGet(API.STAFF_MANAGEMENT.PAYROLL_PERIODS.DETAIL(id)),

  updatePeriod: (id, data) =>
    apiPut(API.STAFF_MANAGEMENT.PAYROLL_PERIODS.UPDATE(id), data),

  deletePeriod: (id) =>
    apiDelete(API.STAFF_MANAGEMENT.PAYROLL_PERIODS.DELETE(id)),

  generatePayroll: (periodId) =>
    apiPost(API.STAFF_MANAGEMENT.PAYROLL_PERIODS.GENERATE(periodId)),
};

export default PayrollPeriodService;
