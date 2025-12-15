// services/staffServices/ExitStaffService.js
import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const ExitStaffService = {
  // List all exited staff members
  listExitedStaff: async () => {
    try {
      const response = await axiosInstance.get(API.STAFF_MANAGEMENT.EXITED_STAFF.LIST);
      return response.data;
    } catch (error) {
      console.error("Error fetching exited staff:", error);
      throw error;
    }
  },

  // Get details of a specific exited staff member
  getExitedStaffDetails: async (staffId) => {
    try {
      const response = await axiosInstance.get(API.STAFF_MANAGEMENT.EXITED_STAFF.DETAIL(staffId));
      return response.data;
    } catch (error) {
      console.error("Error fetching exited staff details:", error);
      throw error;
    }
  },

  // Add a new exited staff member
  addExitedStaff: async (selectedStaff, exitDate, exitReason) => {
    try {
      const response = await axiosInstance.post(API.STAFF_MANAGEMENT.EXITED_STAFF.ADD, {
        user: selectedStaff,
        exit_date: exitDate,
        reason: exitReason,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding exited staff:", error);
      throw error;
    }
  }
};

export default ExitStaffService;
