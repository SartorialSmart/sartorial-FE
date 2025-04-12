import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const VendorService = {
  // Create a new vendor
  createVendor: async (vendorData) => {
    try {
      const response = await axiosInstance.post(API.ORDER_MANAGEMENT.VENDORS.CREATE, vendorData);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating vendor:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to create vendor. Please try again.");
    }
  },

  // Fetch the list of all vendors
  getVendorsList: async () => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.VENDORS.LIST);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching vendor list:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to fetch vendors list. Please try again.");
    }
  },

  // Fetch vendor details by ID
  getVendorDetails: async (vendorId) => {
    try {
      const response = await axiosInstance.get(API.ORDER_MANAGEMENT.VENDORS.DETAIL(vendorId));
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching vendor details (ID: ${vendorId}):`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || `Failed to fetch details for vendor ID: ${vendorId}.`);
    }
  },
};

export default VendorService;
