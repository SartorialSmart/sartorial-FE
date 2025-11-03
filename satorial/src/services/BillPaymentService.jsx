import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";


// Service for Bill Payments
export const BillPaymentService = {
    // Create a new bill payment
    createBillPayment: async (paymentData) => {
      try {
        const response = await axiosInstance.post(API.ORDER_MANAGEMENT.BILLS.BILL_PAYMENT.CREATE, paymentData);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error;
      }
    },
  
    // Get all bill payments
    getBillPayments: async () => {
      try {
        const response = await axiosInstance.get(API.ORDER_MANAGEMENT.BILLS.BILL_PAYMENT.LIST);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error;
      }
    },
  
    // Get a single bill payment by ID
    getBillPaymentById: async (paymentId) => {
      try {
        const response = await axiosInstance.get(API.ORDER_MANAGEMENT.BILLS.BILL_PAYMENT.DETAIL(paymentId));
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error;
      }
    },
  
    // Update a bill payment by ID
    updateBillPayment: async (paymentId, paymentData) => {
      try {
        const response = await axiosInstance.put(API.ORDER_MANAGEMENT.BILLS.BILL_PAYMENT.UPDATE(paymentId), paymentData);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error;
      }
    },
  };