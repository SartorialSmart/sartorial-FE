// services/staffServices/StaffReportService.js

import axiosInstance from "../../../utils/axiosConfig";
import { apiGet } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const StaffReportService = {
  /**
   * Get performance report for all staff members
   * @param {Object} params - Query parameters
   * @param {string} params.staff_id - Filter by specific staff ID (optional)
   * @param {string} params.start_date - Filter by start date (YYYY-MM-DD) (optional)
   * @param {string} params.end_date - Filter by end date (YYYY-MM-DD) (optional)
   * @param {string} params.department - Filter by department (optional)
   * @returns {Promise} Staff performance data
   */
  getAllStaffPerformance: (params = {}) =>
    apiGet(API.STAFF_MANAGEMENT.PERFORMANCE.LIST, { params }),

  /**
   * Get detailed performance report for a specific staff member
   * @param {string} staffId - Staff member UUID
   * @param {Object} params - Query parameters
   * @param {string} params.start_date - Filter by start date (YYYY-MM-DD) (optional)
   * @param {string} params.end_date - Filter by end date (YYYY-MM-DD) (optional)
   * @returns {Promise} Detailed staff performance data with order history
   */
  getStaffPerformanceDetail: (staffId, params = {}) =>
    apiGet(API.STAFF_MANAGEMENT.PERFORMANCE.DETAIL(staffId), { params }),

  /**
   * Get performance report by department
   * @param {Object} params - Query parameters
   * @param {string} params.department - Specific department name (optional)
   * @param {string} params.start_date - Filter by start date (YYYY-MM-DD) (optional)
   * @param {string} params.end_date - Filter by end date (YYYY-MM-DD) (optional)
   * @returns {Promise} Department performance data
   */
  getDepartmentPerformance: (params = {}) =>
    apiGet(API.STAFF_MANAGEMENT.PERFORMANCE.DEPARTMENT, { params }),

  /**
   * Get staff performance for a specific date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {string} staffId - Staff ID (optional)
   * @returns {Promise} Staff performance data
   */
  getStaffPerformanceByDateRange: (startDate, endDate, staffId = null) => {
    const params = {
      start_date: startDate,
      end_date: endDate,
    };

    if (staffId) {
      params.staff_id = staffId;
    }

    return apiGet(API.STAFF_MANAGEMENT.PERFORMANCE.LIST, { params });
  },

  /**
   * Get staff performance by department
   * @param {string} department - Department name
   * @param {Object} dateRange - Optional date range
   * @param {string} dateRange.start_date - Start date (YYYY-MM-DD)
   * @param {string} dateRange.end_date - End date (YYYY-MM-DD)
   * @returns {Promise} Staff performance data filtered by department
   */
  getStaffPerformanceByDepartment: (department, dateRange = {}) =>
    apiGet(API.STAFF_MANAGEMENT.PERFORMANCE.LIST, {
      params: { department, ...dateRange },
    }),

  /**
   * Export staff performance report
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} Blob data for download
   */
  exportStaffPerformance: (params = {}) =>
    apiGet(API.STAFF_MANAGEMENT.PERFORMANCE.LIST, {
      params: { ...params, export: true },
      responseType: "blob",
    }),

  /**
   * Get top performing staff
   * @param {number} limit - Number of top performers to retrieve
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Top performing staff data
   */
  getTopPerformers: async (limit = 10, params = {}) => {
    const data = await apiGet(API.STAFF_MANAGEMENT.PERFORMANCE.LIST, {
      params: { ...params, limit },
    });

    // Sort by completion rate
    const sortedData = data.data.sort(
      (a, b) => b.completion_rate - a.completion_rate
    );

    return {
      ...data,
      data: sortedData.slice(0, limit),
    };
  },

  /**
   * Get staff with highest reassignment rates
   * @param {number} limit - Number of staff to retrieve
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Staff with high reassignment rates
   */
  getHighReassignmentStaff: async (limit = 10, params = {}) => {
    const data = await apiGet(API.STAFF_MANAGEMENT.PERFORMANCE.LIST, {
      params,
    });

    // Sort by reassignment rate (descending)
    const sortedData = data.data.sort(
      (a, b) => b.reassignment_rate - a.reassignment_rate
    );

    return {
      ...data,
      data: sortedData.slice(0, limit),
    };
  },

  /**
   * Get staff workload summary
   * @param {string} staffId - Staff member UUID (optional)
   * @returns {Promise} Staff workload data
   */
  getStaffWorkload: async (staffId = null) => {
    const params = staffId ? { staff_id: staffId } : {};

    const data = await apiGet(API.STAFF_MANAGEMENT.PERFORMANCE.LIST, {
      params,
    });

    // Extract workload metrics
    const workloadData = data.data.map((staff) => ({
      staff_id: staff.staff_id,
      staff_name: staff.staff_name,
      active_orders: staff.active_orders,
      in_progress_orders: staff.in_progress_orders,
      pending_orders: staff.pending_orders,
      assigned_orders: staff.assigned_orders,
      total_workload: staff.active_orders,
    }));

    return {
      success: true,
      data: workloadData,
    };
  },

  /**
   * Compare performance between multiple staff members
   * @param {Array<string>} staffIds - Array of staff UUIDs
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Comparison data
   */
  compareStaffPerformance: async (staffIds, params = {}) => {
    const promises = staffIds.map((staffId) =>
      axiosInstance.get(API.STAFF_MANAGEMENT.PERFORMANCE.DETAIL(staffId), {
        params,
      })
    );

    const responses = await Promise.all(promises);
    const comparisonData = responses.map((response) => response.data.data);

    return {
      success: true,
      count: comparisonData.length,
      data: comparisonData,
    };
  },

  /**
   * Get performance trends over time
   * @param {string} staffId - Staff member UUID
   * @param {Array<Object>} dateRanges - Array of date range objects
   * @returns {Promise} Performance trends data
   */
  getPerformanceTrends: async (staffId, dateRanges) => {
    const promises = dateRanges.map((range) =>
      axiosInstance.get(API.STAFF_MANAGEMENT.PERFORMANCE.DETAIL(staffId), {
        params: {
          start_date: range.start_date,
          end_date: range.end_date,
        },
      })
    );

    const responses = await Promise.all(promises);
    const trendsData = responses.map((response, index) => ({
      period: dateRanges[index],
      metrics: response.data.data,
    }));

    return {
      success: true,
      staff_id: staffId,
      trends: trendsData,
    };
  },

  /**
   * Download staff performance report as Excel
   * @param {Object} params - Query parameters for filtering
   * @param {string} filename - Desired filename (optional)
   * @returns {Promise} Downloads the file
   */
  downloadPerformanceReport: async (params = {}, filename = null) => {
    const blob = await StaffReportService.exportStaffPerformance(params);

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      filename ||
      `staff_performance_report_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  },
};

export default StaffReportService;
