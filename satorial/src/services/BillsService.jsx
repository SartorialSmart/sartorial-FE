import { apiGet, apiPost, apiPut } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const BillsService = {
  createBill: (billData) =>
    apiPost(API.ORDER_MANAGEMENT.BILLS.CREATE, billData),

  updateBillDetails: (billId, updatedBillData) =>
    apiPut(API.ORDER_MANAGEMENT.BILLS.UPDATE(billId), updatedBillData),

  getBillsList: () => apiGet(API.ORDER_MANAGEMENT.BILLS.LIST),

  getBillDetails: (billId) =>
    apiGet(API.ORDER_MANAGEMENT.BILLS.DETAIL(billId)),

  getBillListView: () => apiGet(API.ORDER_MANAGEMENT.BILLS.BILL_LIST),
};

export default BillsService;
