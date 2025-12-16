// services/settingsServices/FabricsService.js

import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const FabricsService = {
  /**
   * Get all fabrics
   * @param {Object} params - Query parameters
   * @param {string} params.fabric_type - Filter by fabric type
   * @returns {Promise} List of fabrics
   */
  getFabrics: async (params = {}) => {
    try {
      const response = await axiosInstance.get(API.SETTINGS.FABRICS.LIST, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching fabrics:", error);
      throw error;
    }
  },

  /**
   * Get fabric statistics
   * @returns {Promise} Fabric statistics
   */
  getFabricStatistics: async () => {
    try {
      const response = await axiosInstance.get(
        API.SETTINGS.FABRICS.STATISTICS
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching fabric statistics:", error);
      throw error;
    }
  },

  /**
   * Get specific fabric
   * @param {string} fabricId - Fabric ID
   * @returns {Promise} Fabric data
   */
  getFabric: async (fabricId) => {
    try {
      const response = await axiosInstance.get(
        API.SETTINGS.FABRICS.DETAIL(fabricId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching fabric:", error);
      throw error;
    }
  },

  /**
   * Create new fabric
   * @param {Object} payload - Fabric data (can be FormData for image upload)
   * @returns {Promise} Created fabric
   */
  createFabric: async (payload) => {
    try {
      const config =
        payload instanceof FormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : {};

      const response = await axiosInstance.post(
        API.SETTINGS.FABRICS.CREATE,
        payload,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error creating fabric:", error);
      throw error;
    }
  },

  /**
   * Update fabric
   * @param {string} fabricId - Fabric ID
   * @param {Object} payload - Updated fabric data (can be FormData for image upload)
   * @returns {Promise} Updated fabric
   */
  updateFabric: async (fabricId, payload) => {
    try {
      const config =
        payload instanceof FormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : {};

      const response = await axiosInstance.put(
        API.SETTINGS.FABRICS.UPDATE(fabricId),
        payload,
        config
      );
      return response.data;
    } catch (error) {
      console.error("Error updating fabric:", error);
      throw error;
    }
  },

  /**
   * Delete fabric
   * @param {string} fabricId - Fabric ID
   * @returns {Promise} Deletion confirmation
   */
  deleteFabric: async (fabricId) => {
    try {
      const response = await axiosInstance.delete(
        API.SETTINGS.FABRICS.DELETE(fabricId)
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting fabric:", error);
      throw error;
    }
  },

  /**
   * Get fabrics by type
   * @param {string} fabricType - Fabric type
   * @returns {Promise} Filtered fabrics
   */
  getFabricsByType: async (fabricType) => {
    return FabricsService.getFabrics({ fabric_type: fabricType });
  },
};

export default FabricsService;