import axiosInstance from '../../utils/axiosConfig';
import { API } from '../api/apiEndpoints';

const AuthService = {
  registerCompany: async (userData) => {
    const response = await axiosInstance.post(API.USER_MANAGEMENT.AUTH.REGISTER_COMPANY, userData);
    return response.data;
  },

  addStaff: async (userData) => {
    const response = await axiosInstance.post(API.USER_MANAGEMENT.STAFF.ADD, userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post(API.USER_MANAGEMENT.AUTH.LOGIN, credentials);
    return response.data;
  },

  getAuthenticatedUser: async () => {
    const response = await axiosInstance.get(API.USER_MANAGEMENT.STAFF.DETAIL('me'));
  },

  updateStaff: async (staffId, staffData) => {
    const response = await axiosInstance.put(API.USER_MANAGEMENT.STAFF.UPDATE + staffId + '/', staffData);
    return response.data;
  },

  deleteStaff: async (staffId) => {
    const response = await axiosInstance.delete(API.USER_MANAGEMENT.STAFF.DETAIL(staffId));
    return response.data;
  },
};

export default AuthService;
