import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const BillsService = {
  createBill: async (billData) => {
    try {
      const response = await axiosInstance.post(
        API.ORDER_MANAGEMENT.BILLS.CREATE,
        billData
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error creating bill:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          "Failed to create bill. Please try again."
      );
    }
  },

  updateBillDetails: async (billId, updatedBillData) => {
    try {
      const response = await axiosInstance.put(
        API.ORDER_MANAGEMENT.BILLS.UPDATE(billId),
        updatedBillData
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error updating bill (ID: ${billId}):`,
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || `Failed to update bill ID: ${billId}.`
      );
    }
  },

  getBillsList: async () => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.BILLS.LIST);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error fetching bills list:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch bills list. Please try again."
      );
    }
  },

  getBillDetails: async (billId) => {
    try {
      const response = await axiosInstance.get(
        API.ORDER_MANAGEMENT.BILLS.DETAIL(billId)
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ Error fetching bill details (ID: ${billId}):`,
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch details for bill ID: ${billId}.`
      );
    }
  },

  getBillListView: async () => {
    try {
      const response = await axiosInstance.get(
        API.ORDER_MANAGEMENT.BILLS.BILL_LIST
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ Error fetching bill list view:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch bill list view. Please try again."
      );
    }
  },
};

export default BillsService;
