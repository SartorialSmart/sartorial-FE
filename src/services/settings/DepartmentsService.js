// services/settingsServices/DepartmentsService.js

import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const DepartmentsService = {
  /**
   * Get all departments
   * @returns {Promise} List of departments
   */
  getDepartments: () => apiGet(API.SETTINGS.DEPARTMENTS.LIST),

  /**
   * Get department statistics with staff count
   * @returns {Promise} Department statistics
   */
  getDepartmentStatistics: () => apiGet(API.SETTINGS.DEPARTMENTS.STATISTICS),

  /**
   * Get specific department
   * @param {string} deptId - Department ID
   * @returns {Promise} Department data
   */
  getDepartment: (deptId) => apiGet(API.SETTINGS.DEPARTMENTS.DETAIL(deptId)),

  /**
   * Create new department
   * @param {Object} payload - Department data
   * @returns {Promise} Created department
   */
  createDepartment: (payload) =>
    apiPost(API.SETTINGS.DEPARTMENTS.CREATE, payload),

  /**
   * Update department
   * @param {string} deptId - Department ID
   * @param {Object} payload - Updated department data
   * @returns {Promise} Updated department
   */
  updateDepartment: (deptId, payload) =>
    apiPut(API.SETTINGS.DEPARTMENTS.UPDATE(deptId), payload),

  /**
   * Delete department
   * @param {string} deptId - Department ID
   * @returns {Promise} Deletion confirmation
   */
  deleteDepartment: (deptId) =>
    apiDelete(API.SETTINGS.DEPARTMENTS.DELETE(deptId)),
};

export default DepartmentsService;
