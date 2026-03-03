import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const AuthService = {
  registerOrganization: async (userData) => {
    const response = await axiosInstance.post(
      API.USER_MANAGEMENT.AUTH.REGISTER_ORGANIZATION,
      userData
    );
    return response.data;
  },

  addStaff: async (userData) => {
    const response = await axiosInstance.post(
      API.STAFF_MANAGEMENT.STAFF.ADD,
      userData
    );
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post(
      API.USER_MANAGEMENT.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  forgotPassword: async (payload) => {
    const response = await axiosInstance.post(
      API.USER_MANAGEMENT.AUTH.FORGOT_PASSWORD,
      payload
    );
    return response.data;
  },

  updateStaff: async (staffId, staffData) => {
    const response = await axiosInstance.put(
      API.STAFF_MANAGEMENT.STAFF.UPDATE(staffId),
      staffData
    );
    return response.data;
  },

  deleteStaff: async (staffId) => {
    const response = await axiosInstance.delete(
      API.STAFF_MANAGEMENT.STAFF.DELETE(staffId)
    );
    return response.data;
  },

  getAuthenticatedUser: async () => {
    try {
      const response = await axiosInstance.get(API.USER_MANAGEMENT.AUTH.DETAIL);

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
      }
      throw error;
    }
  },
};

export default AuthService;
