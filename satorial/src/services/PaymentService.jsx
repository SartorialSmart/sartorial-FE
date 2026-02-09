import { apiGet, apiPost } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const PaymentService = {
  /**
   * Create a new payment for an order.
   * @param {Object} paymentData - Payment details (orderId, amountPaid, etc.)
   * @returns {Promise<Object>} - Created payment response.
   */
  createPayment: (paymentData) =>
    apiPost(API.ORDER_MANAGEMENT.ORDER_PAYMENTS.CREATE, paymentData),

  /**
   * Fetch all payments.
   * @returns {Promise<Array>} - List of payments.
   */
  getAllPayments: () => apiGet(API.ORDER_MANAGEMENT.ORDER_PAYMENTS.LIST),

  /**
   * Fetch details of a specific payment by ID.
   * @param {string | number} paymentId - ID of the payment.
   * @returns {Promise<Object>} - Payment details.
   */
  getPaymentById: (paymentId) =>
    apiGet(API.ORDER_MANAGEMENT.ORDER_PAYMENTS.DETAIL(paymentId)),

  /**
   * Fetch a list of payments.
   * @returns {Promise<Array>} - List of payments.
   */
  getPaymentList: () => apiGet(API.ORDER_MANAGEMENT.ORDER_PAYMENTS.PAYMENT_LIST),
};

export default PaymentService;
