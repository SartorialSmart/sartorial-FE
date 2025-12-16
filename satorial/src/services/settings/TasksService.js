// services/settingsServices/TasksService.js

import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const TasksService = {
  /**
   * Get all tasks
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {string} params.priority - Filter by priority
   * @returns {Promise} List of tasks
   */
  getTasks: async (params = {}) => {
    try {
      const response = await axiosInstance.get(API.SETTINGS.TASKS.LIST, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  /**
   * Get task statistics
   * @returns {Promise} Task statistics
   */
  getTaskStatistics: async () => {
    try {
      const response = await axiosInstance.get(
        API.SETTINGS.TASKS.STATISTICS
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching task statistics:", error);
      throw error;
    }
  },

  /**
   * Get specific task
   * @param {string} taskId - Task ID
   * @returns {Promise} Task data
   */
  getTask: async (taskId) => {
    try {
      const response = await axiosInstance.get(
        API.SETTINGS.TASKS.DETAIL(taskId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
    }
  },

  /**
   * Create new task
   * @param {Object} payload - Task data
   * @returns {Promise} Created task
   */
  createTask: async (payload) => {
    try {
      const response = await axiosInstance.post(
        API.SETTINGS.TASKS.CREATE,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  /**
   * Update task
   * @param {string} taskId - Task ID
   * @param {Object} payload - Updated task data
   * @returns {Promise} Updated task
   */
  updateTask: async (taskId, payload) => {
    try {
      const response = await axiosInstance.put(
        API.SETTINGS.TASKS.UPDATE(taskId),
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  /**
   * Delete task
   * @param {string} taskId - Task ID
   * @returns {Promise} Deletion confirmation
   */
  deleteTask: async (taskId) => {
    try {
      const response = await axiosInstance.delete(
        API.SETTINGS.TASKS.DELETE(taskId)
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  /**
   * Get tasks by status
   * @param {string} status - Task status
   * @returns {Promise} Filtered tasks
   */
  getTasksByStatus: async (status) => {
    return TasksService.getTasks({ status });
  },

  /**
   * Get tasks by priority
   * @param {string} priority - Task priority
   * @returns {Promise} Filtered tasks
   */
  getTasksByPriority: async (priority) => {
    return TasksService.getTasks({ priority });
  },
};

export default TasksService;