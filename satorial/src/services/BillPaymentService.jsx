import { apiGet, apiPost, apiPut } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

// Service for Bill Payments
export const BillPaymentService = {
  // Create a new bill payment
  createBillPayment: (paymentData) =>
    apiPost(API.ORDER_MANAGEMENT.BILLS.BILL_PAYMENT.CREATE, paymentData),

  // Get all bill payments
  getBillPayments: () =>
    apiGet(API.ORDER_MANAGEMENT.BILLS.BILL_PAYMENT.LIST),

  // Get a single bill payment by ID
  getBillPaymentById: (paymentId) =>
    apiGet(API.ORDER_MANAGEMENT.BILLS.BILL_PAYMENT.DETAIL(paymentId)),

  // Update a bill payment by ID
  updateBillPayment: (paymentId, paymentData) =>
    apiPut(API.ORDER_MANAGEMENT.BILLS.BILL_PAYMENT.UPDATE(paymentId), paymentData),
};
