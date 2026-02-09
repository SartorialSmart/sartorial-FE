import { apiGet, apiPost } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const PayRollService = {

  // Create a new payroll
  createPayroll: (payload) =>
    apiPost(API.STAFF_MANAGEMENT.PAYROLL.ADD, payload),

  // List all payrolls
  listPayrolls: () => apiGet(API.STAFF_MANAGEMENT.PAYROLL.LIST),

  // Get details of a specific payroll
  getPayrollDetail: (payrollId) =>
    apiGet(API.STAFF_MANAGEMENT.PAYROLL.DETAIL(payrollId)),
};

export default PayRollService;
