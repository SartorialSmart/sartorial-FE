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
    const formData = new FormData();

    for (const key in staffData) {
      if (Object.prototype.hasOwnProperty.call(staffData, key)) {
        formData.append(key, staffData[key]);
      }
    }

    try {
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
    const formData = new FormData();

    for (const key in updatedData) {
      if (Object.prototype.hasOwnProperty.call(updatedData, key)) {
        formData.append(key, updatedData[key]);
      }
    }

    const response = await axiosInstance.put(
      API.STAFF_MANAGEMENT.STAFF.UPDATE(slug),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteStaff: async (slug) => {
    const response = await axiosInstance.delete(
      API.STAFF_MANAGEMENT.STAFF.DELETE(slug)
    );
    return response.data;
  },
};

export default StaffService;
