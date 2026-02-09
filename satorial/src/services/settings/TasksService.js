// services/settingsServices/TasksService.js

import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const TasksService = {
  /**
   * Get all tasks
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {string} params.priority - Filter by priority
   * @returns {Promise} List of tasks
   */
  getTasks: (params = {}) => apiGet(API.SETTINGS.TASKS.LIST, { params }),

  /**
   * Get task statistics
   * @returns {Promise} Task statistics
   */
  getTaskStatistics: () => apiGet(API.SETTINGS.TASKS.STATISTICS),

  /**
   * Get specific task
   * @param {string} taskId - Task ID
   * @returns {Promise} Task data
   */
  getTask: (taskId) => apiGet(API.SETTINGS.TASKS.DETAIL(taskId)),

  /**
   * Create new task
   * @param {Object} payload - Task data
   * @returns {Promise} Created task
   */
  createTask: (payload) => apiPost(API.SETTINGS.TASKS.CREATE, payload),

  /**
   * Update task
   * @param {string} taskId - Task ID
   * @param {Object} payload - Updated task data
   * @returns {Promise} Updated task
   */
  updateTask: (taskId, payload) =>
    apiPut(API.SETTINGS.TASKS.UPDATE(taskId), payload),

  /**
   * Delete task
   * @param {string} taskId - Task ID
   * @returns {Promise} Deletion confirmation
   */
  deleteTask: (taskId) => apiDelete(API.SETTINGS.TASKS.DELETE(taskId)),

  /**
   * Get tasks by status
   * @param {string} status - Task status
   * @returns {Promise} Filtered tasks
   */
  getTasksByStatus: (status) => TasksService.getTasks({ status }),

  /**
   * Get tasks by priority
   * @param {string} priority - Task priority
   * @returns {Promise} Filtered tasks
   */
  getTasksByPriority: (priority) => TasksService.getTasks({ priority }),
};

export default TasksService;
