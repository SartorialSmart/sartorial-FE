import axiosInstance from "../../utils/axiosConfig";
import { API } from "../api/apiEndpoints";

const ReportService = {
  // Fetch monthly statistics report
  getMonthlyStatistics: async () => {
    const response = await axiosInstance.get(API.REPORT.MONTHLY_STATISTICS);
    return response.data;
  },

  // Fetch report summary
  getReportSummary: async () => {
    const response = await axiosInstance.get(API.REPORT.REPORT_SUMMARY);
    return response.data;
  },

  // Fetch order summary report
  getOrderSummary: async () => {
    const response = await axiosInstance.get(API.REPORT.ORDER_SUMMARY);
    return response.data;
  },

  // Fetch payment summary report
  getPaymentSummary: async () => {
    const response = await axiosInstance.get(API.REPORT.PAYMENT_SUMMARY);
    return response.data;
  },

  // Fetch staff performance report
  getStaffPerformance: async () => {
    const response = await axiosInstance.get(API.REPORT.STAFF_PERFORMANCE);
    return response.data;
  },

  // Fetch total sales by duration report
  getSalesByDuration: async () => {
    const response = await axiosInstance.get(API.REPORT.SALES_BY_DURATION);
    return response.data;
  },
};

export default ReportService;
