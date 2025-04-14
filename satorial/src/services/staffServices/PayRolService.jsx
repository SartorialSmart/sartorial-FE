import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const PayRollService = {

    // Create a new payroll
createPayroll: async (payload) => {
  try {
    const response = await axiosInstance.post(API.STAFF_MANAGEMENT.PAYROLL.ADD, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating payroll:", error);
    throw error;
  }
},

  // List all payrolls
  listPayrolls: async () => {
    try {
      const response = await axiosInstance.get(API.STAFF_MANAGEMENT.PAYROLL.LIST);
      return response.data;
    } catch (error) {
      console.error("Error fetching payroll list:", error);
      throw error;
    }
  },

  // Get details of a specific payroll
  getPayrollDetail: async (payrollId) => {
    try {
      const response = await axiosInstance.get(API.STAFF_MANAGEMENT.PAYROLL.DETAIL(payrollId));
      return response.data;
    } catch (error) {
      console.error("Error fetching payroll details:", error);
      throw error;
    }
  },
};

export default PayRollService;
