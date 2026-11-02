// services/settingsServices/FabricsService.js

import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const FabricsService = {
  /**
   * Get all fabrics
   * @param {Object} params - Query parameters
   * @param {string} params.fabric_type - Filter by fabric type
   * @returns {Promise} List of fabrics
   */
  getFabrics: (params = {}) => apiGet(API.SETTINGS.FABRICS.LIST, { params }),

  /**
   * Get fabric statistics
   * @returns {Promise} Fabric statistics
   */
  getFabricStatistics: () => apiGet(API.SETTINGS.FABRICS.STATISTICS),

  /**
   * Get specific fabric
   * @param {string} fabricId - Fabric ID
   * @returns {Promise} Fabric data
   */
  getFabric: (fabricId) => apiGet(API.SETTINGS.FABRICS.DETAIL(fabricId)),

  /**
   * Create new fabric
   * @param {Object} payload - Fabric data (can be FormData for image upload)
   * @returns {Promise} Created fabric
   */
  createFabric: (payload) => {
    return apiPost(API.SETTINGS.FABRICS.CREATE, payload);
  },

  /**
   * Update fabric
   * @param {string} fabricId - Fabric ID
   * @param {Object} payload - Updated fabric data (can be FormData for image upload)
   * @returns {Promise} Updated fabric
   */
  updateFabric: (fabricId, payload) => {
    return apiPut(API.SETTINGS.FABRICS.UPDATE(fabricId), payload);
  },

  /**
   * Delete fabric
   * @param {string} fabricId - Fabric ID
   * @returns {Promise} Deletion confirmation
   */
  deleteFabric: (fabricId) => apiDelete(API.SETTINGS.FABRICS.DELETE(fabricId)),

  /**
   * Get fabrics by type
   * @param {string} fabricType - Fabric type
   * @returns {Promise} Filtered fabrics
   */
  getFabricsByType: (fabricType) =>
    FabricsService.getFabrics({ fabric_type: fabricType }),
};

export default FabricsService;
