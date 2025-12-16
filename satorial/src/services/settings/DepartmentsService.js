// services/settingsServices/DepartmentsService.js

import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const DepartmentsService = {
  /**
   * Get all departments
   * @returns {Promise} List of departments
   */
  getDepartments: async () => {
    try {
      const response = await axiosInstance.get(API.SETTINGS.DEPARTMENTS.LIST);
      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },

  /**
   * Get department statistics with staff count
   * @returns {Promise} Department statistics
   */
  getDepartmentStatistics: async () => {
    try {
      const response = await axiosInstance.get(
        API.SETTINGS.DEPARTMENTS.STATISTICS
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching department statistics:", error);
      throw error;
    }
  },

  /**
   * Get specific department
   * @param {string} deptId - Department ID
   * @returns {Promise} Department data
   */
  getDepartment: async (deptId) => {
    try {
      const response = await axiosInstance.get(
        API.SETTINGS.DEPARTMENTS.DETAIL(deptId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching department:", error);
      throw error;
    }
  },

  /**
   * Create new department
   * @param {Object} payload - Department data
   * @returns {Promise} Created department
   */
  createDepartment: async (payload) => {
    try {
      const response = await axiosInstance.post(
        API.SETTINGS.DEPARTMENTS.CREATE,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error creating department:", error);
      throw error;
    }
  },

  /**
   * Update department
   * @param {string} deptId - Department ID
   * @param {Object} payload - Updated department data
   * @returns {Promise} Updated department
   */
  updateDepartment: async (deptId, payload) => {
    try {
      const response = await axiosInstance.put(
        API.SETTINGS.DEPARTMENTS.UPDATE(deptId),
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating department:", error);
      throw error;
    }
  },

  /**
   * Delete department
   * @param {string} deptId - Department ID
   * @returns {Promise} Deletion confirmation
   */
  deleteDepartment: async (deptId) => {
    try {
      const response = await axiosInstance.delete(
        API.SETTINGS.DEPARTMENTS.DELETE(deptId)
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting department:", error);
      throw error;
    }
  },
};

export default DepartmentsService;