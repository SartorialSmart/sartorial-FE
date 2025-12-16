// services/settingsServices/RolesService.js

import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const RolesService = {
  /**
   * Get all roles
   * @returns {Promise} List of roles
   */
  getRoles: async () => {
    try {
      const response = await axiosInstance.get(API.SETTINGS.ROLES.LIST);
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },

  /**
   * Get specific role
   * @param {string} roleId - Role ID
   * @returns {Promise} Role data
   */
  getRole: async (roleId) => {
    try {
      const response = await axiosInstance.get(
        API.SETTINGS.ROLES.DETAIL(roleId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching role:", error);
      throw error;
    }
  },

  /**
   * Create new role
   * @param {Object} payload - Role data
   * @returns {Promise} Created role
   */
  createRole: async (payload) => {
    try {
      const response = await axiosInstance.post(
        API.SETTINGS.ROLES.CREATE,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  },

  /**
   * Update role
   * @param {string} roleId - Role ID
   * @param {Object} payload - Updated role data
   * @returns {Promise} Updated role
   */
  updateRole: async (roleId, payload) => {
    try {
      const response = await axiosInstance.put(
        API.SETTINGS.ROLES.UPDATE(roleId),
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  },

  /**
   * Delete role
   * @param {string} roleId - Role ID
   * @returns {Promise} Deletion confirmation
   */
  deleteRole: async (roleId) => {
    try {
      const response = await axiosInstance.delete(
        API.SETTINGS.ROLES.DELETE(roleId)
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  },
};

export default RolesService;