import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const PaymentService = {
  /**
   * Create a new payment for an order.
   * @param {Object} paymentData - Payment details (orderId, amountPaid, etc.)
   * @returns {Promise<Object>} - Created payment response.
   */
  createPayment: async (paymentData) => {
    try {
      const response = await axiosInstance.post(API.ORDER_MANAGEMENT.ORDER_PAYMENTS.CREATE, paymentData);
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  /**
   * Fetch all payments.
   * @returns {Promise<Array>} - List of payments.
   */
  getAllPayments: async () => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.ORDER_PAYMENTS.LIST);
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },

  /**
   * Fetch details of a specific payment by ID.
   * @param {string | number} paymentId - ID of the payment.
   * @returns {Promise<Object>} - Payment details.
   */
  getPaymentById: async (paymentId) => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.ORDER_PAYMENTS.DETAIL(paymentId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment ID ${paymentId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch a list of payments.
   * @returns {Promise<Array>} - List of payments.
   */
  getPaymentList: async () => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.ORDER_PAYMENTS.PAYMENT_LIST);
      return response.data;
    } catch (error) {
      console.error("Error fetching payment list:", error);
      throw error;
    }
  },
};

export default PaymentService;
