// services/settingsServices/RolesService.js

import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const RolesService = {
  /**
   * Get all roles
   * @returns {Promise} List of roles
   */
  getRoles: () => apiGet(API.SETTINGS.ROLES.LIST),

  /**
   * Get specific role
   * @param {string} roleId - Role ID
   * @returns {Promise} Role data
   */
  getRole: (roleId) => apiGet(API.SETTINGS.ROLES.DETAIL(roleId)),

  /**
   * Create new role
   * @param {Object} payload - Role data
   * @returns {Promise} Created role
   */
  createRole: (payload) => apiPost(API.SETTINGS.ROLES.CREATE, payload),

  /**
   * Update role
   * @param {string} roleId - Role ID
   * @param {Object} payload - Updated role data
   * @returns {Promise} Updated role
   */
  updateRole: (roleId, payload) =>
    apiPut(API.SETTINGS.ROLES.UPDATE(roleId), payload),

  /**
   * Delete role
   * @param {string} roleId - Role ID
   * @returns {Promise} Deletion confirmation
   */
  deleteRole: (roleId) => apiDelete(API.SETTINGS.ROLES.DELETE(roleId)),
};

export default RolesService;
