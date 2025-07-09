import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const StaffService = {
  // List all staff members
  listStaff: async () => {
    const response = await axiosInstance.get(API.STAFF_MANAGEMENT.STAFF.LIST);
    return response.data;
  },

  // Get single staff detail
  getStaffDetail: async (slug) => {
    const response = await axiosInstance.get(
      API.STAFF_MANAGEMENT.STAFF.DETAIL(slug)
    );
    return response.data;
  },

  addStaff: async (staffData) => {
    try {
      const formData = new FormData();

      // Append each field to FormData with the correct field names
      Object.keys(staffData).forEach((key) => {
        // Skip null or undefined values
        if (staffData[key] != null) {
          // Handle file objects separately
          if (key === "avatar" && staffData[key] instanceof File) {
            formData.append(key, staffData[key]);
          } else {
            // Convert non-string values to string
            formData.append(key, String(staffData[key]));
          }
        }
      });

      // Log FormData entries for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`FormData entry - ${key}:`, value);
      }

      const response = await axiosInstance.post(
        API.STAFF_MANAGEMENT.STAFF.ADD,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding staff:", error);
      throw error;
    }
  },

  updateStaff: async (slug, updatedData) => {
    const response = await axiosInstance.put(
      API.STAFF_MANAGEMENT.STAFF.UPDATE(slug),
      updatedData
    );
    return response.data;
  },

  deleteStaff: async (slug) => {
    const response = await axiosInstance.delete(
      API.STAFF_MANAGEMENT.STAFF.DELETE(slug)
    );
    return response.data;
  },

  // Update staff salary
  updateSalary: async (payload) => {
    try {
      const response = await axiosInstance.post(
        API.STAFF_MANAGEMENT.SALARY.UPDATE,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating salary:", error);
      throw error;
    }
  },
};

export default StaffService;
